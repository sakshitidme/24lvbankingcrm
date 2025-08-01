'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  Cloud,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
  multiple?: boolean
  disabled?: boolean
  showPreview?: boolean
  uploadEndpoint?: string
  storageProvider?: 'local' | 's3' | 'cloudinary'
}

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  className,
  multiple = true,
  disabled = false,
  showPreview = true,
  uploadEndpoint = '/api/upload',
  storageProvider = 'local'
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type === 'application/pdf') return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<{ url: string; error?: string }> => {
    // Simulate upload based on storage provider
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different storage providers
        switch (storageProvider) {
          case 's3':
            resolve({ 
              url: `https://your-bucket.s3.amazonaws.com/uploads/${Date.now()}-${file.name}` 
            })
            break
          case 'cloudinary':
            resolve({ 
              url: `https://res.cloudinary.com/your-cloud/image/upload/v1/${Date.now()}-${file.name}` 
            })
            break
          default:
            resolve({ 
              url: `/uploads/${Date.now()}-${file.name}` 
            })
        }
      }, 2000 + Math.random() * 3000) // Simulate 2-5 second upload
    })
  }

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      
      // Check if we've reached max files
      if (files.length + newFiles.length >= maxFiles) {
        break
      }

      const error = validateFile(file)
      const uploadedFile: UploadedFile = {
        file,
        id: `${Date.now()}-${i}`,
        progress: 0,
        status: error ? 'error' : 'uploading',
        error: error || undefined
      }

      newFiles.push(uploadedFile)
    }

    setFiles(prev => [...prev, ...newFiles])

    // Upload files without errors
    for (const uploadedFile of newFiles) {
      if (!uploadedFile.error) {
        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            ))
          }, 200)

          const result = await uploadFile(uploadedFile.file)
          
          clearInterval(progressInterval)
          
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { 
                  ...f, 
                  progress: 100, 
                  status: result.error ? 'error' : 'success',
                  url: result.url,
                  error: result.error
                }
              : f
          ))
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { 
                  ...f, 
                  status: 'error',
                  error: 'Upload failed'
                }
              : f
          ))
        }
      }
    }

    // Notify parent component
    const allFiles = [...files, ...newFiles].map(f => f.file)
    onFilesChange?.(allFiles)
  }, [files, maxFiles, onFilesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }, [disabled, processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      onFilesChange?.(updated.map(f => f.file))
      return updated
    })
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver && !disabled && 'border-blue-500 bg-blue-50',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-blue-400 hover:bg-blue-50/50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              'p-4 rounded-full',
              storageProvider === 's3' && 'bg-orange-100',
              storageProvider === 'cloudinary' && 'bg-blue-100',
              storageProvider === 'local' && 'bg-gray-100'
            )}>
              {storageProvider === 's3' && <Cloud className="h-8 w-8 text-orange-600" />}
              {storageProvider === 'cloudinary' && <Cloud className="h-8 w-8 text-blue-600" />}
              {storageProvider === 'local' && <Upload className="h-8 w-8 text-gray-600" />}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">
                {isDragOver ? 'Drop files here' : 'Upload files'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop files here, or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max {maxFiles} files, {maxSize}MB each
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: {acceptedTypes.join(', ')}
              </p>
            </div>

            <Button 
              variant="outline" 
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                openFileDialog()
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>

            {storageProvider !== 'local' && (
              <Badge variant="secondary" className="mt-2">
                <Cloud className="h-3 w-3 mr-1" />
                {storageProvider.toUpperCase()} Storage
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && showPreview && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((uploadedFile) => {
              const Icon = getFileIcon(uploadedFile.file)
              
              return (
                <Card key={uploadedFile.id} className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'p-2 rounded',
                      uploadedFile.status === 'success' && 'bg-green-100',
                      uploadedFile.status === 'error' && 'bg-red-100',
                      uploadedFile.status === 'uploading' && 'bg-blue-100'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4',
                        uploadedFile.status === 'success' && 'text-green-600',
                        uploadedFile.status === 'error' && 'text-red-600',
                        uploadedFile.status === 'uploading' && 'text-blue-600'
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      
                      {uploadedFile.status === 'uploading' && (
                        <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                      )}
                      
                      {uploadedFile.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {uploadedFile.error}
                        </p>
                      )}
                      
                      {uploadedFile.url && (
                        <p className="text-xs text-green-600 mt-1">
                          Upload complete
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === 'success' && (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          {uploadedFile.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(uploadedFile.url, '_blank')}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                      
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadedFile.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}