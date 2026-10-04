import { useState, type FormEvent, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ErrorMessage from '../components/common/ErrorMessage';
import styles from './LoginPage.module.css';

type Mode = 'login' | 'register';

interface FormErrors {
  username?: string;
  password?: string;
  email?: string;
}

// 前端先行校验，规则与后端 DTO 一致：用户名 3~20、密码 ≥6、邮箱可选且需合法格式。
function validate(username: string, password: string, email?: string): FormErrors {
  const errors: FormErrors = {};
  if (username.length < 3 || username.length > 20) {
    errors.username = '用户名需为 3~20 个字符';
  }
  if (password.length < 6) {
    errors.password = '密码至少 6 位';
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = '邮箱格式不正确';
  }
  return errors;
}

function LoginPage(): ReactElement {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    // 表单校验：空表单/不合规会被前端拦截，不进入 store。
    const next = validate(
      username.trim(),
      password,
      mode === 'register' ? email.trim() : undefined,
    );
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (mode === 'login') {
      await login({ username: username.trim(), password });
    } else {
      await register({ username: username.trim(), password, email: email.trim() || undefined });
    }
    // 成功后 store 写入 token，跳转到今日复习页。
    if (useAuthStore.getState().token) {
      navigate('/today');
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            type="button"
            className={mode === 'register' ? styles.tabActive : styles.tab}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>

        <ErrorMessage message={error} />

        <Input
          label="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          placeholder="3~20 个字符"
          autoComplete="username"
        />
        <Input
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="至少 6 位"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {mode === 'register' && (
          <Input
            label="邮箱（可选）"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="可选，格式需合法"
          />
        )}

        <Button type="submit" loading={loading} className={styles.submit}>
          {mode === 'login' ? '登录' : '注册'}
        </Button>
      </form>
    </div>
  );
}

export default LoginPage;
