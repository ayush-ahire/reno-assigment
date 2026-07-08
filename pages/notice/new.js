import Head from 'next/head';
import NoticeForm from '@/components/NoticeForm';

export default function NewNotice() {
  return (
    <>
      <Head>
        <title>Add Notice - Notice Board Pro</title>
        <meta name="description" content="Add a new announcement to the public notice board." />
      </Head>

      <div className="py-6">
        <NoticeForm />
      </div>
    </>
  );
}
