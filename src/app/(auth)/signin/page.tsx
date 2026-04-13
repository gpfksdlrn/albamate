import AuthForm from '@/features/auth/components/AuthForm';
import AuthSns from '@/features/auth/components/AuthSns';

const SignInPage = () => {
  return (
    <>
      <h1 className="sr-only">로그인 페이지</h1>
      <AuthForm />
      <AuthSns />
    </>
  );
};

export default SignInPage;
