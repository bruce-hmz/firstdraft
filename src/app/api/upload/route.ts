import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const page_id = formData.get('page_id') as string;

    if (!file || !page_id) {
      return NextResponse.json(
        { error: 'Missing file or page_id' },
        { status: 400 }
      );
    }

    // 验证页面是否存在
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('id')
      .eq('id', page_id)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExt}`;
    const filePath = `pages/${page_id}/${fileName}`;

    // 上传文件到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // 获取文件 URL
    const { data: urlData } = supabase
      .storage
      .from('media')
      .getPublicUrl(filePath);

    // 保存媒体记录到数据库
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .insert({
        page_id,
        filename: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size
      })
      .select()
      .single();

    if (mediaError) {
      return NextResponse.json(
        { error: 'Failed to save media record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: media
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const page_id = request.nextUrl.searchParams.get('page_id');

    if (!page_id) {
      return NextResponse.json(
        { error: 'Missing page_id' },
        { status: 400 }
      );
    }

    const { data: media, error } = await supabase
      .from('media')
      .select('*')
      .eq('page_id', page_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: media
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing media id' },
        { status: 400 }
      );
    }

    // 获取媒体信息
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('id, url, page_id')
      .eq('id', id)
      .single();

    if (mediaError || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // 从 Supabase Storage 删除文件
    const filePath = media.url.split('/').slice(-3).join('/');
    const { error: storageError } = await supabase
      .storage
      .from('media')
      .remove([`pages/${media.page_id}/${filePath.split('/').pop()}`]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // 从数据库删除记录
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete media' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
