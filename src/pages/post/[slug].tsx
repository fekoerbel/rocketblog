import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  function averageTime(arr = post.data.content) {
    var total = 0;
    for (let i = 0; i < arr.length; i++) {
      let heading = arr[i].heading;
      let body = arr[i].body;

      let text = heading;
      for (let j = 0; j < body.length; j++) {
        text += " " + body[j].text;
      }

      let textClean = text.replace(/[^\w\s]/gi, '');

      let words = textClean.split(/\s+/);

      total += words.length
    }
    return Math.ceil(total / 200)
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }


  return (
    <>
      <Head>
        <title>{post.data.title} | ig.news</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <img src={post.data.banner.url} alt={post.data.title} />
          <div className={styles.postContent}>
            <h1>{post.data.title}</h1>
            <div className={styles.timeContainer}>
              <div>
                <FiCalendar />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
              </div>
              <div>
                <FiUser /> {post.data.author}
              </div>
              <div>
                <FiClock /> {averageTime()} min
              </div>
            </div>

            {post.data.content.map(contentBody => (
              <div key={contentBody.heading}>
                <h2>{contentBody.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(contentBody.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>

  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const postsPaths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });
  return {
    paths: postsPaths,
    fallback: true,
  }
};

export const getStaticProps = async ({ params }) => {
  const slug = params?.slug
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});
  console.log(response)
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    },
    content: response.data.content,
  }
  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 min
  }
};
