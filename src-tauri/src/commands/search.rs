use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchOptions {
    #[serde(rename = "caseSensitive")]
    pub case_sensitive: bool,
    #[serde(rename = "wholeWord")]
    pub whole_word: bool,
    pub regex: bool,
    #[serde(rename = "includePattern")]
    pub include_pattern: Option<String>,
    #[serde(rename = "excludePattern")]
    pub exclude_pattern: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub line_number: usize,
    pub line_content: String,
    pub match_start: usize,
    pub match_end: usize,
}

/// Search for text in files within a directory
#[tauri::command]
pub async fn search_in_files(
    path: String,
    query: String,
    options: SearchOptions,
) -> Result<Vec<SearchResult>, String> {
    log::info!("Searching in: {} for: {}", path, query);
    
    let path_obj = Path::new(&path);
    if !path_obj.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let mut results = Vec::new();
    
    // Parse include/exclude patterns
    let include_patterns = parse_patterns(options.include_pattern.as_deref());
    let exclude_patterns = parse_patterns(options.exclude_pattern.as_deref());
    
    // Add default excludes
    let mut default_excludes = vec![
        "node_modules".to_string(),
        ".git".to_string(),
        "target".to_string(),
        "dist".to_string(),
        "build".to_string(),
        ".next".to_string(),
        ".cache".to_string(),
    ];
    default_excludes.extend(exclude_patterns);

    // Walk directory
    for entry in WalkDir::new(&path)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            // Skip excluded directories
            if e.file_type().is_dir() {
                let name = e.file_name().to_string_lossy();
                return !default_excludes.iter().any(|ex| name.contains(ex));
            }
            true
        })
    {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        // Only process files
        if !entry.file_type().is_file() {
            continue;
        }

        let file_path = entry.path();
        let file_path_str = file_path.to_string_lossy().to_string();

        // Check include patterns
        if !include_patterns.is_empty() {
            let matches_include = include_patterns.iter().any(|pattern| {
                file_path_str.ends_with(pattern) || 
                file_path.file_name()
                    .and_then(|n| n.to_str())
                    .map(|n| matches_glob(n, pattern))
                    .unwrap_or(false)
            });
            
            if !matches_include {
                continue;
            }
        }

        // Read file content
        let content = match fs::read_to_string(file_path) {
            Ok(c) => c,
            Err(_) => continue, // Skip binary files or files we can't read
        };

        // Search in file
        let file_results = search_in_content(
            &content,
            &query,
            &file_path_str,
            &options,
        );
        
        results.extend(file_results);
    }

    log::info!("Found {} matches", results.len());
    Ok(results)
}

/// Replace text in files
#[tauri::command]
pub async fn replace_in_files(
    results: Vec<SearchResult>,
    replace_text: String,
) -> Result<usize, String> {
    log::info!("Replacing in {} results", results.len());
    
    // Group results by file
    let mut files: HashMap<String, Vec<SearchResult>> = HashMap::new();
    for result in results {
        files.entry(result.file_path.clone())
            .or_insert_with(Vec::new)
            .push(result);
    }

    let mut replaced_count = 0;

    // Process each file
    for (file_path, file_results) in files {
        // Read file content
        let content = fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read file {}: {}", file_path, e))?;

        let mut lines: Vec<String> = content.lines().map(|s| s.to_string()).collect();

        // Sort results by line number in descending order to avoid offset issues
        let mut sorted_results = file_results;
        sorted_results.sort_by(|a, b| b.line_number.cmp(&a.line_number));

        // Replace in each line
        for result in sorted_results {
            if result.line_number > 0 && result.line_number <= lines.len() {
                let line_idx = result.line_number - 1;
                let line = &lines[line_idx];
                
                // Replace the match
                let before = &line[..result.match_start];
                let after = &line[result.match_end..];
                lines[line_idx] = format!("{}{}{}", before, replace_text, after);
                
                replaced_count += 1;
            }
        }

        // Write back to file
        let new_content = lines.join("\n");
        fs::write(&file_path, new_content)
            .map_err(|e| format!("Failed to write file {}: {}", file_path, e))?;
    }

    log::info!("Replaced {} matches", replaced_count);
    Ok(replaced_count)
}

/// Search within file content
fn search_in_content(
    content: &str,
    query: &str,
    file_path: &str,
    options: &SearchOptions,
) -> Vec<SearchResult> {
    let mut results = Vec::new();

    if options.regex {
        // Regex search
        let pattern = if options.case_sensitive {
            query.to_string()
        } else {
            format!("(?i){}", query)
        };

        let re = match regex::Regex::new(&pattern) {
            Ok(r) => r,
            Err(_) => return results, // Invalid regex
        };

        for (line_num, line) in content.lines().enumerate() {
            for mat in re.find_iter(line) {
                results.push(SearchResult {
                    file_path: file_path.to_string(),
                    line_number: line_num + 1,
                    line_content: line.to_string(),
                    match_start: mat.start(),
                    match_end: mat.end(),
                });
            }
        }
    } else {
        // Plain text search
        let search_query = if options.case_sensitive {
            query.to_string()
        } else {
            query.to_lowercase()
        };

        for (line_num, line) in content.lines().enumerate() {
            let search_line = if options.case_sensitive {
                line.to_string()
            } else {
                line.to_lowercase()
            };

            let mut start = 0;
            while let Some(pos) = search_line[start..].find(&search_query) {
                let match_start = start + pos;
                let match_end = match_start + query.len();

                // Check whole word if needed
                if options.whole_word {
                    let before_ok = match_start == 0 || 
                        !line.chars().nth(match_start - 1).unwrap_or(' ').is_alphanumeric();
                    let after_ok = match_end >= line.len() || 
                        !line.chars().nth(match_end).unwrap_or(' ').is_alphanumeric();
                    
                    if !before_ok || !after_ok {
                        start = match_end;
                        continue;
                    }
                }

                results.push(SearchResult {
                    file_path: file_path.to_string(),
                    line_number: line_num + 1,
                    line_content: line.to_string(),
                    match_start,
                    match_end,
                });

                start = match_end;
            }
        }
    }

    results
}

/// Parse comma-separated patterns
fn parse_patterns(patterns: Option<&str>) -> Vec<String> {
    patterns
        .map(|p| {
            p.split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        })
        .unwrap_or_default()
}

/// Simple glob matching (supports * wildcard)
fn matches_glob(text: &str, pattern: &str) -> bool {
    if pattern == "*" {
        return true;
    }

    if !pattern.contains('*') {
        return text == pattern;
    }

    let parts: Vec<&str> = pattern.split('*').collect();
    
    if parts.len() == 2 {
        let prefix = parts[0];
        let suffix = parts[1];
        
        if prefix.is_empty() {
            return text.ends_with(suffix);
        }
        if suffix.is_empty() {
            return text.starts_with(prefix);
        }
        
        return text.starts_with(prefix) && text.ends_with(suffix);
    }

    // More complex patterns - just check if all parts exist in order
    let mut pos = 0;
    for part in parts {
        if part.is_empty() {
            continue;
        }
        if let Some(found) = text[pos..].find(part) {
            pos += found + part.len();
        } else {
            return false;
        }
    }
    
    true
}

