import { useCallback, useEffect, useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import NetworkGraph from './components/NetworkGraph.jsx';
import Loading from './components/Loading.jsx';
import { buildNetwork } from './lib/buildNetwork.js';
import './App.css';

function useViewportSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

export default function App() {
  const { width, height } = useViewportSize();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState(null);

  const selectArtist = useCallback(
    async (name) => {
      if (!name || name === center || loading) return;
      setLoading(true);
      setCenter(name);
      try {
        const next = await buildNetwork(name);
        setGraph(next);
      } catch (err) {
        console.error(err);
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
          onSelectArtist={selectArtist}
        />
      )}

      {!graph && !loading && (
        <div className="empty-state">
          <p>アーティスト名を検索してネットワークを表示</p>
        </div>
      )}

      {loading && <Loading />}

      <SearchBar onSelectArtist={selectArtist} />
    </div>
  );
}
