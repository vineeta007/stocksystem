import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  await dbConnect();

  const products = await Product.find();

  return Response.json(products);
}

export async function POST(req) {
  await dbConnect();

  const body = await req.json();

  const product = await Product.create(body);

  return Response.json(product);
}