import AuthForm from '@/features/auth/components/AuthForm';
// import AuthSns from '@/features/auth/components/AuthSns';

const AccountPage = () => {
  return (
    <>
      <h1 className="sr-only">정보 입력 페이지</h1>
      <AuthForm />
      {/* <AuthSns /> */}
    </>
  );
};

export default AccountPage;
