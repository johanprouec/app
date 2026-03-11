'use client';

import styles from './login.module.css';

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>AgroConnect</h1>
          <p className={styles.subtitle}>Connecting the future of farming</p>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              className={styles.input}
              placeholder="farmer@agroconnect.io"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.button}>
            Access Platform
          </button>
        </form>

        <div className={styles.footer}>
          New to the ecosystem?
          <a href="#" className={styles.link}>Join AgroConnect</a>
        </div>
      </div>
    </main>
  );
}
