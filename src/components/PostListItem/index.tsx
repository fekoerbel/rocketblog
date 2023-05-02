import styles from './postListitem.module.scss';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

interface PostListItemProps {
    uid: string;
    title: string;
    subtitle: string;
    date: string;
    author: string;
}

export default function PostListItem({ uid, title, subtitle, date, author }: PostListItemProps) {
    return (
        <div className={styles.post}>
            <Link href={`/post/${uid}`}>
                <a>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                    <div className={styles.infos}>
                        <div>
                            <FiCalendar />
                            <time>{date}</time>
                        </div>
                        <div>
                            <FiUser />
                            <span>{author}</span>
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    )
}