import { GetStaticProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';
import { RichText } from 'prismic-dom'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import PostListItem from '../components/PostListItem';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  async function getNextPage(): Promise<void> {
    await fetch(nextPage)
      .then(response => {
        return response.json()
      })
      .then(data => {
        const postsResponse = data.results.map(post => {
          return {
            key: post.uid,
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        })
        console.log(data.next_page)
        setPosts([...postsResponse, ...posts]);
        setNextPage(data.next_page);
      })
  }
  return (
    <>
      <Head>
        <title>Posts | spacetraveling.</title>
      </Head>

      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          {posts.map(post => (
            <PostListItem
              key={post.data.title}
              uid={post.uid}
              title={post.data.title}
              subtitle={post.data.subtitle}
              date={format(
                new Date(post.first_publication_date),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                }
              )}
              author={post.data.author}
            />
          ))}
        </div>
        {nextPage && (
          <button
            onClick={getNextPage}
            type="button"
            className={styles.button}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>

  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });
  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    },
  }
};
