use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub modified: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileTreeNode {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub children: Option<Vec<FileTreeNode>>,
}

/// Read file content as string
#[tauri::command]
pub async fn read_file_content(path: String) -> Result<String, String> {
    log::info!("Reading file: {}", path);
    
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

/// Write content to file
#[tauri::command]
pub async fn write_file_content(path: String, content: String) -> Result<(), String> {
    log::info!("Writing file: {}", path);
    
    // Create parent directories if they don't exist
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directories: {}", e))?;
    }
    
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

/// Create a new file
#[tauri::command]
pub async fn create_file(path: String) -> Result<(), String> {
    log::info!("Creating file: {}", path);
    
    // Create parent directories if they don't exist
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directories: {}", e))?;
    }
    
    // Create empty file
    fs::write(&path, "")
        .map_err(|e| format!("Failed to create file '{}': {}", path, e))
}

/// Delete a file
#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    log::info!("Deleting file: {}", path);
    
    let path_obj = Path::new(&path);
    
    if path_obj.is_dir() {
        fs::remove_dir_all(&path)
            .map_err(|e| format!("Failed to delete directory '{}': {}", path, e))
    } else {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to delete file '{}': {}", path, e))
    }
}

/// Rename/move a file
#[tauri::command]
pub async fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    log::info!("Renaming file: {} -> {}", old_path, new_path);
    
    // Create parent directories for new path if they don't exist
    if let Some(parent) = Path::new(&new_path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directories: {}", e))?;
    }
    
    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename file '{}' to '{}': {}", old_path, new_path, e))
}

/// Create a new directory
#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    log::info!("Creating directory: {}", path);
    
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create directory '{}': {}", path, e))
}

/// List files in a directory
#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    log::info!("Listing directory: {}", path);
    
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory '{}': {}", path, e))?;
    
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        let metadata = entry.metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        
        let file_entry = FileEntry {
            path: path.to_string_lossy().to_string(),
            name: entry.file_name().to_string_lossy().to_string(),
            is_directory: metadata.is_dir(),
            size: if metadata.is_file() { Some(metadata.len()) } else { None },
            modified: metadata.modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs()),
        };
        
        files.push(file_entry);
    }
    
    // Sort: directories first, then files, both alphabetically
    files.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(files)
}

/// Build a file tree recursively
#[tauri::command]
pub async fn list_directory_tree(path: String, max_depth: Option<usize>) -> Result<FileTreeNode, String> {
    log::info!("Building file tree for: {}", path);
    
    let max_depth = max_depth.unwrap_or(10);
    build_tree_recursive(&path, 0, max_depth)
}

fn build_tree_recursive(path: &str, current_depth: usize, max_depth: usize) -> Result<FileTreeNode, String> {
    let path_obj = Path::new(path);
    
    let name = path_obj
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or(path)
        .to_string();
    
    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to read metadata for '{}': {}", path, e))?;
    
    let is_directory = metadata.is_dir();
    
    let mut node = FileTreeNode {
        name,
        path: path.to_string(),
        is_directory,
        children: None,
    };
    
    // If it's a directory and we haven't reached max depth, recurse
    if is_directory && current_depth < max_depth {
        let entries = fs::read_dir(path)
            .map_err(|e| format!("Failed to read directory '{}': {}", path, e))?;
        
        let mut children = Vec::new();
        
        for entry in entries {
            let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
            let entry_path = entry.path();
            
            // Skip hidden files and common ignore patterns
            let file_name = entry.file_name();
            let file_name_str = file_name.to_string_lossy();
            
            if should_ignore(&file_name_str) {
                continue;
            }
            
            match build_tree_recursive(&entry_path.to_string_lossy(), current_depth + 1, max_depth) {
                Ok(child_node) => children.push(child_node),
                Err(e) => {
                    log::warn!("Failed to build tree for '{}': {}", entry_path.display(), e);
                    // Continue with other entries
                }
            }
        }
        
        // Sort children: directories first, then files
        children.sort_by(|a, b| {
            match (a.is_directory, b.is_directory) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
            }
        });
        
        node.children = Some(children);
    }
    
    Ok(node)
}

/// Check if a file/directory should be ignored
fn should_ignore(name: &str) -> bool {
    // Hidden files (starting with .)
    if name.starts_with('.') && name != "." && name != ".." {
        return true;
    }
    
    // Common ignore patterns
    let ignore_patterns = [
        "node_modules",
        "target",
        "dist",
        "build",
        ".git",
        ".svn",
        ".hg",
        "__pycache__",
        ".pytest_cache",
        ".venv",
        "venv",
        ".DS_Store",
        "Thumbs.db",
    ];
    
    ignore_patterns.contains(&name)
}

/// Check if a path exists
#[tauri::command]
pub async fn path_exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

/// Check if a path is a directory
#[tauri::command]
pub async fn is_directory(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).is_dir())
}

/// Get file metadata
#[tauri::command]
pub async fn get_file_metadata(path: String) -> Result<FileEntry, String> {
    let path_obj = Path::new(&path);
    let metadata = fs::metadata(&path)
        .map_err(|e| format!("Failed to read metadata for '{}': {}", path, e))?;
    
    Ok(FileEntry {
        path: path.clone(),
        name: path_obj
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or(&path)
            .to_string(),
        is_directory: metadata.is_dir(),
        size: if metadata.is_file() { Some(metadata.len()) } else { None },
        modified: metadata.modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs()),
    })
}

