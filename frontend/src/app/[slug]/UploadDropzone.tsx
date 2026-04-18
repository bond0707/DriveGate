'use client';
import {
    Box, Typography, TextField, Button, IconButton,
    LinearProgress, List, ListItem, ListItemIcon,
    Tooltip, InputAdornment,
} from '@mui/material';
import {
    CloudUpload, CheckCircle, Error as ErrorIcon, Close,
    InsertDriveFile, Image as ImageIcon,
    Folder, CreateNewFolder, FolderOpen,
} from '@mui/icons-material';
import { m, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import SquircleLoader from '@/components/SquircleLoader';
import { MotionPaper } from '@/components/motion';

interface FileStatus {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
    relativePath?: string;
}

interface UploadDropzoneProps {
    files: FileStatus[];
    isUploading: boolean;
    isTransitioningToSuccess: boolean;
    targetFolderName: string;
    showNewFolderInput: boolean;
    newFolderName: string;
    isCreatingFolder: boolean;
    hasCreatedFolder: boolean;
    onDrop: (acceptedFiles: File[]) => void;
    onRemoveFile: (index: number) => void;
    onClearAll: () => void;
    onUploadAll: () => void;
    onSetShowNewFolderInput: (show: boolean) => void;
    onNewFolderNameChange: (name: string) => void;
    onCreateNewFolder: () => void;
}

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    return <InsertDriveFile />;
};

export default function UploadDropzone({
    files, isUploading, isTransitioningToSuccess,
    targetFolderName, showNewFolderInput, newFolderName,
    isCreatingFolder, hasCreatedFolder,
    onDrop, onRemoveFile, onClearAll, onUploadAll,
    onSetShowNewFolderInput, onNewFolderNameChange, onCreateNewFolder,
}: UploadDropzoneProps) {
    const newFolderRowRef = useRef<HTMLDivElement | null>(null);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    const pendingCount = files.filter(f => f.status !== 'success').length;

    return (
        <MotionPaper
            key="upload-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            elevation={0}
            sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ ms: 2 }}>
                Upload Files
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                Files and folders will be uploaded directly in the folder given below.
            </Typography>

            {/* Folder bar */}
            {!isUploading && !isTransitioningToSuccess && (
                <Box sx={{ mx: 2, mb: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        minHeight: 44,
                    }}>
                        <FolderOpen sx={{ color: '#00897B', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                            {targetFolderName}
                        </Typography>
                        {!showNewFolderInput && !hasCreatedFolder && (
                            <Tooltip title="Create new folder">
                                <IconButton size="small" sx={{ color: '#00897B' }} onClick={() => onSetShowNewFolderInput(true)}>
                                    <CreateNewFolder fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Inline new folder input */}
                    <AnimatePresence>
                        {showNewFolderInput && (
                            <m.div
                                ref={newFolderRowRef}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 0.5, display: 'block' }}>
                                    Create a new folder inside &ldquo;{targetFolderName}&rdquo; to upload into
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Folder name"
                                        value={newFolderName}
                                        onChange={(e) => onNewFolderNameChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onCreateNewFolder();
                                        }}
                                        disabled={isCreatingFolder}
                                        autoFocus
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Folder fontSize="small" sx={{ color: '#00897B' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={onCreateNewFolder}
                                        disabled={!newFolderName.trim() || isCreatingFolder}
                                        sx={{
                                            borderRadius: 2,
                                            bgcolor: '#00897B',
                                            color: 'white',
                                            minWidth: 80,
                                            '&:hover': { bgcolor: '#00695C' },
                                        }}
                                    >
                                        {isCreatingFolder ? <SquircleLoader size={16} color="white" /> : 'Create'}
                                    </Button>
                                </Box>
                            </m.div>
                        )}
                    </AnimatePresence>
                </Box>
            )}

            {/* Dropzone */}
            {!isUploading && !isTransitioningToSuccess && (
                <Box sx={{ m: 2 }}>
                    <Box
                        {...getRootProps()}
                        sx={{
                            border: '2px dashed',
                            borderColor: isDragActive ? 'primary.main' : 'divider',
                            borderRadius: 3,
                            bgcolor: isDragActive ? 'action.hover' : 'transparent',
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                        }}
                    >
                        <input {...getInputProps()} />
                        <CloudUpload sx={{ fontSize: 48, color: '#00897B', mb: 2 }} />
                        <Typography fontWeight={500}>
                            Drag & drop files or folders here, or click to select files.
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* File list */}
            {files.length > 0 && (
                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    mb: 3,
                    maxHeight: 300,
                    mx: 2,
                    px: 2.3,
                    '&::-webkit-scrollbar': { width: 8 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'action.hover', borderRadius: 4 },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: '#00897B',
                        borderRadius: 4,
                        '&:hover': { bgcolor: '#00695C' },
                    },
                }}>
                    <List disablePadding>
                        {files.map((fileStatus, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    mb: 1,
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    p: 0,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, pr: 6 }}>
                                    <ListItemIcon sx={{ color: "#00897B", minWidth: 40 }}>
                                        {fileStatus.status === 'success' ? (
                                            <CheckCircle color="success" />
                                        ) : fileStatus.status === 'error' ? (
                                            <ErrorIcon color="error" />
                                        ) : (
                                            getFileIcon(fileStatus.file.type)
                                        )}
                                    </ListItemIcon>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography noWrap fontWeight={500} fontSize="0.9rem">
                                            {fileStatus.relativePath || fileStatus.file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {fileStatus.status === 'success' ? 'Uploaded' :
                                                fileStatus.status === 'error' ? 'Failed' :
                                                    fileStatus.status === 'uploading' ? `Uploading... ${fileStatus.progress}%` :
                                                        `${(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB`}
                                        </Typography>
                                    </Box>
                                    {(fileStatus.status === 'pending' || fileStatus.status === 'error') && (
                                        <IconButton
                                            size="small"
                                            onClick={() => onRemoveFile(index)}
                                            sx={{ position: 'absolute', right: 8 }}
                                        >
                                            <Close fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                                {fileStatus.status === 'uploading' && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={fileStatus.progress}
                                        sx={{
                                            height: 4,
                                            bgcolor: 'action.hover',
                                            '& .MuiLinearProgress-bar': { bgcolor: '#00897B' },
                                        }}
                                    />
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 100, p: 0.5, gap: 0.5, mt: 'auto', mx: 2, mb: 1 }}>
                <Button
                    size="small"
                    onClick={onClearAll}
                    disabled={isUploading || files.length === 0}
                    sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: '0.875rem' }}
                >
                    Clear All
                </Button>
                <Button
                    size="small"
                    onClick={onUploadAll}
                    disabled={files.length === 0 || isUploading || files.every(f => f.status === 'success')}
                    startIcon={isUploading ? <SquircleLoader size={16} color="white" /> : <CloudUpload sx={{ fontSize: 18 }} />}
                    sx={{
                        flex: 1,
                        borderRadius: 100,
                        py: 0.75,
                        fontSize: '0.875rem',
                        bgcolor: '#00897B',
                        color: 'white',
                        '&:hover': { bgcolor: '#00695C' },
                        '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                            color: 'action.disabled',
                        },
                    }}
                >
                    {isUploading
                        ? 'Uploading...'
                        : `Upload ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`
                    }
                </Button>
            </Box>
        </MotionPaper>
    );
}
