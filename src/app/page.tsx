'use client';

import styles from './home.module.css';
import Link from 'next/link';

export default function HomePage() {
    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>Sustainable Farming</div>
                    <h1 className={styles.heroTitle}>The New Era of Agriculture</h1>
                    <p style={{ color: '#fff', opacity: 0.9, marginBottom: '24px' }}>
                        Sustainable farming solutions for a better tomorrow.
                    </p>
                    <Link href="/login" className={styles.badge} style={{ textDecoration: 'none', background: '#fff', color: '#1b4332' }}>
                        View Dashboard
                    </Link>
                </div>
            </section>

            <div className={styles.contentWrapper}>
                {/* Quick Stats Grid */}
                <div className={styles.dashboardGrid}>
                    {/* Weather & Sensor Card */}
                    <div className={`${styles.card} styles.weatherCard`}>
                        <div className={styles.weatherHeader}>
                            <div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Sunday, 01 Dec 2024</p>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Chanti Hills</h3>
                            </div>
                            <div className={styles.temp}>+16°C</div>
                        </div>
                        <div className={styles.metricsGrid}>
                            <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Soil Temp</span>
                                <span className={styles.metricValue}>+22°C</span>
                            </div>
                            <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Humidity</span>
                                <span className={styles.metricValue}>59%</span>
                            </div>
                            <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Wind</span>
                                <span className={styles.metricValue}>6 m/s</span>
                            </div>
                            <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Moisture</span>
                                <span className={styles.metricValue}>75%</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Card */}
                    <div className={styles.card}>
                        <div className={styles.sectionTitle}>
                            <span>Field Activity</span>
                            <span style={{ fontSize: '0.8rem', color: '#52b788' }}>Live</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                            Drones currently surveying Sector A. Growth rate optimized at 12cm/week.
                            Moisture levels are stable across all olive fields.
                        </p>
                    </div>
                </div>

                {/* Commodities Slider */}
                <h2 className={styles.sectionTitle}>Commodities and Food</h2>
                <div className={styles.commoditySlider}>
                    {['Rice', 'Corn', 'Grapes', 'Potato', 'Olive', 'Tomatoes'].map((item) => (
                        <div key={item} className={styles.commodityItem}>
                            <span>📦</span> {item}
                        </div>
                    ))}
                </div>

                {/* My Fields Grid */}
                <h2 className={styles.sectionTitle}>My Fields</h2>
                <div className={styles.dashboardGrid}>
                    {[
                        { name: 'Olive Field', status: 'Healthy', yield: '7500 Kg/ha', date: 'Dec 24, 2024' },
                        { name: 'Vineyard East', status: 'Harvesting', yield: '4200 Kg/ha', date: 'Nov 12, 2024' },
                        { name: 'Valley Farm', status: 'Seeding', yield: 'N/A', date: 'Jan 05, 2025' }
                    ].map((field) => (
                        <div key={field.name} className={`${styles.card} ${styles.fieldCard}`}>
                            <div style={{ height: '140px', background: '#e9edc9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                🚜
                            </div>
                            <div className={styles.fieldInfo}>
                                <span className={styles.fieldTag}>{field.status}</span>
                                <h3 style={{ margin: '8px 0' }}>{field.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                                    <span>Yield: {field.yield}</span>
                                    <span>{field.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <nav className={styles.bottomNav}>
                <div className={`${styles.navItem} ${styles.navItemActive}`}>🏠</div>
                <div className={styles.navItem}>📊</div>
                <div className={styles.navItem}>💬</div>
                <div className={styles.navItem}>👤</div>
            </nav>
        </main>
    );
}
