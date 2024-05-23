import { Prisma } from '@prisma/client';
import { client } from '../services/prisma';

type PostCreateBody = Prisma.Args<typeof client.carpeta, 'create'>['data'];

const addPost = async (
  postBody: PostCreateBody 
) => {
  const post = await client.carpeta.create(
    {
      data: postBody,
    } 
  );
  return post;
};

await addPost(
  myData 
);
//              ^ guaranteed to match the input of `post.create`
