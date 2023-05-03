import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
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

export default function Post(post: Post) {
  function averageTime(arr = post.data.content) {
    var total = 0;
    for (let i = 0; i < arr.length; i++) {
      let heading = arr[i].heading;
      let body = arr[i].body;

      // concatenar as strings de heading e body em uma única string
      let text = heading;
      for (let j = 0; j < body.length; j++) {
        text += " " + body[j].text;
      }

      // remover todos os caracteres que não são letras ou espaços em branco
      let textClean = text.replace(/[^\w\s]/gi, '');

      // dividir o text em palavras
      let words = textClean.split(/\s+/);

      // exibir o número de words no console
      console.log(`O objeto ${i + 1} tem ${words.length} palavras no total.`)
      total += words.length
    }
    console.log(total)
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | ig.news</title>
      </Head>
      {averageTime()}
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
              {/* <div>
                <FiClock /> {tempRead} min
              </div> */}
            </div>

            {post.data.content.map(contentBody => (
              <div key={contentBody.heading}>
                <strong>{contentBody.heading}</strong>
                <div
                  // eslint-disable-next-line react/no-danger
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
  // const prismic = getPrismicClient({});
  // const posts = await prismic.getByType('posts');
  return {
    paths: [],
    fallback: 'blocking'
  }

  // TODO
};

export const getStaticProps = async ({ params }) => {
  const slug = params?.slug
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    },

    content: response.data.content,
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  return {
    props: post,
    revalidate: 60 * 30 // 30 min
  }
};
