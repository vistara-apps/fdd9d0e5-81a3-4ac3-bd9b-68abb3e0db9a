import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const CreateProductSchema = z.object({
  productId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  imageUrl: z.string().url().optional(),
  storeId: z.string().optional(),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    brand: z.string().optional(),
    sku: z.string().optional(),
    inventory: z.number().optional(),
    featured: z.boolean().optional(),
  }).optional(),
});

const UpdateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    brand: z.string().optional(),
    sku: z.string().optional(),
    inventory: z.number().optional(),
    featured: z.boolean().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productData = CreateProductSchema.parse(body);

    // Check if product already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', productData.productId)
      .single();

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product already exists' },
        { status: 409 }
      );
    }

    // Create new product
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        id: uuidv4(),
        product_id: productData.productId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        image_url: productData.imageUrl || null,
        metadata: productData.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const category = searchParams.get('category');
    const storeId = searchParams.get('storeId');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase.from('products').select('*');

    // Apply filters
    if (productId) {
      query = query.eq('product_id', productId);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    if (featured === 'true') {
      query = query.eq('metadata->featured', true);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    // If requesting a single product by ID
    if (productId && products && products.length === 1) {
      return NextResponse.json({
        success: true,
        data: products[0],
      });
    }

    return NextResponse.json({
      success: true,
      data: products || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = UpdateProductSchema.parse(body);

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
