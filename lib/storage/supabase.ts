import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 이미지를 Supabase Storage에 업로드
 * @param file - 업로드할 파일
 * @param bucket - 버킷 이름 (기본: post-images)
 * @returns 업로드된 이미지의 public URL
 */
export async function uploadImage(
  file: File,
  bucket: string = 'post-images'
): Promise<string> {
  // 파일 검증
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('이미지는 5MB 이하만 가능합니다');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다');
  }

  // 고유한 파일명 생성
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Supabase Storage에 업로드
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('이미지 업로드 실패');
  }

  // Public URL 생성
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * 서버 사이드에서 이미지 업로드 (Buffer 사용)
 * @param buffer - 파일 버퍼
 * @param fileName - 파일명
 * @param contentType - MIME 타입
 * @param bucket - 버킷 이름
 * @returns 업로드된 이미지의 public URL
 */
export async function uploadImageFromBuffer(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  bucket: string = 'post-images'
): Promise<string> {
  // 파일명 생성
  const fileExt = fileName.split('.').pop();
  const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

  // Supabase Storage에 업로드
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueFileName, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('이미지 업로드 실패');
  }

  // Public URL 생성
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * 이미지 삭제
 * @param filePath - 삭제할 파일 경로
 * @param bucket - 버킷 이름
 */
export async function deleteImage(
  filePath: string,
  bucket: string = 'post-images'
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('이미지 삭제 실패');
  }
}
