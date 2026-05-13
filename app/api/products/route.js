import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find();

    return Response.json(products);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const product = await Product.create(body);

    return Response.json(product);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}