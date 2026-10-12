import { useCallback, useEffect, useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import NetworkGraph from './components/NetworkGraph.jsx';
import Loading from './components/Loading.jsx';
import { buildNetwork } from './lib/buildNetwork.js';
import './App.css';

// Bottom safe-area inset (px). env() can't be read from JS directly, so measure
// it through a probe element's padding.
function measureSafeBottom() {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;' +
    'padding-bottom:env(safe-area-inset-bottom, 0px)';
  document.body.appendChild(probe);
  const inset = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  probe.remove();
  return inset;
}

function readViewport() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    safeBottom: measureSafeBottom(),
  };
}

// Re-measured on every resize, which also fires on orientation changes.
function useViewportSize() {
  const [size, setSize] = useState(readViewport);

  useEffect(() => {
    const onResize = () => setSize(readViewport());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

export default function App() {
  const { width, height, safeBottom } = useViewportSize();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState(null);
  const [error, setError] = useState(false);

  const selectArtist = useCallback(
    async (name) => {
      if (!name || name === center || loading) return;
      setLoading(true);
      setError(false);
      try {
        const next = await buildNetwork(name);
        setGraph(next);
        setCenter(name);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [center, loading],
  );

  return (
    <div className="app">
      {graph && (
        <NetworkGraph
          graph={graph}
          width={width}
          height={height}
          safeBottom={safeBottom}
          onSelectArtist={selectArtist}
        />
      )}

      {!graph && !loading && (
        <div className="empty-state">
          <p>アーティスト名を検索してネットワークを表示</p>
        </div>
      )}

      {loading && <Loading />}

      <SearchBar
        onSelectArtist={selectArtist}
        error={error}
        onError={setError}
      />
    </div>
  );
}
