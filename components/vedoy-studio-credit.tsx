import styles from "./vedoy-studio-credit.module.css";

/** Accessible Vedoy Studio attribution using the repository's official VEDOY logo. */
export function VedoyStudioCredit({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className={compact ? `${styles.credit} ${styles.compact}` : styles.credit}
      href="https://vedoystudio.no"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Utviklet av Vedoy Studio – besøk vedoystudio.no"
    >
      <img
        className={styles.logo}
        src="/brand/vedoy-logo-white.svg"
        alt=""
        aria-hidden="true"
        width={110}
        height={46}
        loading="lazy"
      />
      <span className={styles.caption}>Utviklet av <strong>Vedoy Studio</strong></span>
    </a>
  );
}
