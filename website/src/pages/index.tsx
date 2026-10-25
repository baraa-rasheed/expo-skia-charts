import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import ChartGrid from '../components/ChartGrid';

const features = [
  { title: 'GPU rendered', body: 'Drawn by Skia Graphite on Metal and Vulkan via react-native-skia 3.8.' },
  { title: 'UI-thread animation', body: 'Reanimated shared values feed Skia props directly — no React re-render per frame.' },
  { title: '15+ chart types', body: 'Line, area, bar, pie, scatter, radar, candlestick, heatmap, gauge, rings and more.' },
  { title: 'Made for touch', body: 'Scrub, tap to select, long-press, pinch to zoom. All gestures run as worklets on the UI thread.' },
  { title: 'Agent-ready', body: 'AGENTS.md ships in the package, plus llms.txt and type-checked recipes. One prop shape for every chart.' },
  { title: 'Effects built in', body: 'Shadows, glow, blur, colour filters, blend modes, path effects, clip reveals, SkSL shaders.' },
];

export default function Home(): ReactNode {
  return (
    <Layout title="react-native-skia-chart" description="GPU-accelerated animated charts for React Native & Expo">
      <header className={styles.hero}>
        <img src={useBaseUrl('/img/logo.svg')} width={88} height={88} alt="" />
        <h1>react-native-skia-chart</h1>
        <p>Charts drawn on the GPU with Skia, animated on the UI thread, with an API your coding agent can't easily get wrong.</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">Get started</Link>
          <Link className="button button--secondary button--lg" to="/docs/interaction">Interactions</Link>
          <Link className="button button--secondary button--lg" to="/docs/agents">For AI agents</Link>
        </div>
        <pre className={styles.install}>npx expo install react-native-skia-chart react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler</pre>
      </header>
      <main className={styles.features}>
        {features.map((f) => (
          <div key={f.title} className={styles.card}><h3>{f.title}</h3><p>{f.body}</p></div>
        ))}
      </main>
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem 3rem' }}>
        <h2 style={{ textAlign: 'center' }}>What you get</h2>
        <ChartGrid />
      </section>
    </Layout>
  );
}
