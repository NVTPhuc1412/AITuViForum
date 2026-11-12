import React, { useState, useEffect, useCallback } from 'react';
import { PythonSearchResult, DocumentItem } from '../types';
import { api } from '../api/client';
import {
  ArrowLeft,
  Sliders,
  RefreshCw,
  Activity,
  Cpu,
  Sparkles,
  Database,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Info,
  Search,
  Zap,
  TrendingUp,
  Clock,
  BookOpen,
} from 'lucide-react';

interface AlgorithmLabPageProps {
  onBackToForum: () => void;
  onSelectDoc?: (id: number) => void;
}

export const AlgorithmLabPage: React.FC<AlgorithmLabPageProps> = ({
  onBackToForum,
  onSelectDoc,
}) => {
  const [query, setQuery] = useState('Inverted Index');
  const [alpha, setAlpha] = useState(0.65);
  const [beta, setBeta] = useState(0.35);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildMsg, setRebuildMsg] = useState<string | null>(null);

  // Results for each method
  const [hybridResults, setHybridResults] = useState<PythonSearchResult[]>([]);
  const [bm25Results, setBm25Results] = useState<PythonSearchResult[]>([]);
  const [tfidfResults, setTfidfResults] = useState<PythonSearchResult[]>([]);
  const [semanticResults, setSemanticResults] = useState<PythonSearchResult[]>([]);
  const [sqlResults, setSqlResults] = useState<DocumentItem[]>([]);

  // Metadata & Timings
  const [tokens, setTokens] = useState<string[]>([]);
  const [hybridTime, setHybridTime] = useState<number>(0);
  const [bm25Time, setBm25Time] = useState<number>(0);
  const [tfidfTime, setTfidfTime] = useState<number>(0);
  const [semanticTime, setSemanticTime] = useState<number>(0);
  const [sqlTime, setSqlTime] = useState<number>(0);

  // Health Stats
  const [healthInfo, setHealthInfo] = useState<{
    status: string;
    indexed_documents: number;
    vocabulary_size: number;
    average_doc_length: number;
    semantic_ready?: boolean;
    semantic_model?: string;
  } | null>(null);

  // Sub-tab for deep-dive
  const [activeSubTab, setActiveSubTab] = useState<'tokens' | 'rank_shift' | 'math'>('tokens');

  // Preset query suggestions
  const presetQueries = [
    'Inverted Index',
    'Information Retrieval',
    'BM25',
    'TF-IDF',
    'Support Vector Machines',
    'RAG Pipeline',
  ];

  // Fetch health check
  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.getPythonHealth();
      setHealthInfo(res);
    } catch {
      setHealthInfo(null);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Execute parallel search across all algorithms
  const runParallelBenchmark = useCallback(
    async (searchQuery: string, currentAlpha: number, currentLimit: number, currentBeta: number) => {
      const q = searchQuery.trim();
      if (!q) return;

      setLoading(true);

      // 1. Python Search: Hybrid
      const tHybridStart = performance.now();
      const hybridPromise = api
        .pythonSearch(q, 'hybrid', currentLimit, currentAlpha, currentBeta)
        .then((res) => {
          setHybridTime(Math.round(performance.now() - tHybridStart));
          return res.data;
        })
        .catch(() => null);

      // 2. Python Search: BM25
      const tBm25Start = performance.now();
      const bm25Promise = api
        .pythonSearch(q, 'bm25', currentLimit, currentAlpha, currentBeta)
        .then((res) => {
          setBm25Time(Math.round(performance.now() - tBm25Start));
          return res.data;
        })
        .catch(() => null);

      // 3. Python Search: TF-IDF
      const tTfidfStart = performance.now();
      const tfidfPromise = api
        .pythonSearch(q, 'tfidf', currentLimit, currentAlpha, currentBeta)
        .then((res) => {
          setTfidfTime(Math.round(performance.now() - tTfidfStart));
          return res.data;
        })
        .catch(() => null);

      // 4. Python Search: Semantic Embedding (Dense Retrieval)
      const tSemanticStart = performance.now();
      const semanticPromise = api
        .pythonSearch(q, 'semantic', currentLimit, currentAlpha, currentBeta)
        .then((res) => {
          setSemanticTime(Math.round(performance.now() - tSemanticStart));
          return res.data;
        })
        .catch(() => null);

      // 5. Node.js SQL LIKE Search
      const tSqlStart = performance.now();
      const sqlPromise = api
        .getDocuments({ search: q, limit: currentLimit })
        .then((res) => {
          setSqlTime(Math.round(performance.now() - tSqlStart));
          return res.data.documents;
        })
        .catch(() => [] as DocumentItem[]);

      const [hybridData, bm25Data, tfidfData, semanticData, sqlData] = await Promise.all([
        hybridPromise,
        bm25Promise,
        tfidfPromise,
        semanticPromise,
        sqlPromise,
      ]);

      if (hybridData) {
        setHybridResults(hybridData.results || []);
        setTokens(hybridData.tokens || []);
      }
      if (bm25Data) {
        setBm25Results(bm25Data.results || []);
      }
      if (tfidfData) {
        setTfidfResults(tfidfData.results || []);
      }
      if (semanticData) {
        setSemanticResults(semanticData.results || []);
      }
      setSqlResults(sqlData || []);

      setLoading(false);
    },
    []
  );

  // Trigger search on mount or when parameters change
  useEffect(() => {
    runParallelBenchmark(query, alpha, limit, beta);
  }, [alpha, beta, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runParallelBenchmark(query, alpha, limit, beta);
  };

  const handleRebuild = async () => {
    try {
      setRebuilding(true);
      setRebuildMsg(null);
      const res = await api.rebuildPythonIndex();
      setRebuildMsg(`Đã lập lại chỉ mục cho ${res.indexed_documents} tài liệu!`);
      await fetchHealth();
      await runParallelBenchmark(query, alpha, limit, beta);
    } catch {
      setRebuildMsg('Không thể kết nối Search Engine service.');
    } finally {
      setRebuilding(false);
    }
  };

  // Rank Shift Icon Helper
  const renderRankShift = (targetRank?: number, baselineRank?: number) => {
    if (!targetRank || !baselineRank) {
      return (
        <span className="text-parchment-dim flex items-center gap-0.5 text-[11px]">
          <Minus className="w-3 h-3" /> 0
        </span>
      );
    }
    const diff = baselineRank - targetRank;
    if (diff > 0) {
      return (
        <span className="text-jade-light font-bold flex items-center gap-0.5 text-[11px]">
          <ArrowUpRight className="w-3.5 h-3.5" /> +{diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="text-lacquer-light font-bold flex items-center gap-0.5 text-[11px]">
          <ArrowDownRight className="w-3.5 h-3.5" /> {diff}
        </span>
      );
    }
    return (
      <span className="text-parchment-dim flex items-center gap-0.5 text-[11px]">
        <Minus className="w-3 h-3" /> 0
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-night-950 text-parchment">
      {/* Top Header / Lab Banner */}
      <header className="sticky top-0 z-40 bg-night-900/95 backdrop-blur border-b border-night-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToForum}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-night-800 hover:bg-night-700 border border-night-line text-parchment hover:text-brass text-xs font-semibold rounded transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Về Diễn đàn</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brass animate-pulse"></span>
              <h1 className="font-serif text-lg sm:text-xl font-semibold text-parchment">
                AstroAI Search Engine Lab
              </h1>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 bg-brass/15 text-brass-light border border-brass/30 rounded">
                Backend Benchmark Mode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {healthInfo && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-night-800 border border-night-line text-[11px] text-parchment-muted rounded">
                <span className="flex items-center gap-1 text-jade-light font-semibold">
                  <Activity className="w-3 h-3" /> Service Online
                </span>
                <span>Docs: <strong className="text-parchment">{healthInfo.indexed_documents}</strong></span>
                <span>Vocab: <strong className="text-parchment">{healthInfo.vocabulary_size}</strong></span>
                <span className={`flex items-center gap-1 font-semibold ${healthInfo.semantic_ready ? 'text-jade-light' : 'text-parchment-dim'}`}>
                  <Sparkles className="w-3 h-3" /> {healthInfo.semantic_ready ? 'Semantic Ready' : 'Semantic Off'}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRebuild}
              disabled={rebuilding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lacquer/15 hover:bg-lacquer/25 text-lacquer-light border border-lacquer/40 text-xs font-semibold rounded transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${rebuilding ? 'animate-spin' : ''}`} />
              <span>{rebuilding ? 'Đang Rebuild...' : 'Rebuild Index'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Rebuild Message Notification */}
        {rebuildMsg && (
          <div className="p-3 bg-jade/10 border border-jade/30 rounded text-xs text-jade-light flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-jade" /> {rebuildMsg}
            </span>
            <button
              onClick={() => setRebuildMsg(null)}
              className="text-parchment-dim hover:text-parchment"
            >
              ×
            </button>
          </div>
        )}

        {/* Experiment Controller Card */}
        <section className="bg-night-900 border border-night-line rounded-lg p-5 sm:p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-night-line pb-4">
            <div>
              <h2 className="font-serif text-lg text-parchment flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brass" />
                <span>Bảng Điều khiển Thực nghiệm Thuật toán</span>
              </h2>
              <p className="text-xs text-parchment-muted mt-0.5">
                Nhập từ khóa và tinh chỉnh trực tiếp tham số để kiểm tra phản ứng của từng thuật toán backend.
              </p>
            </div>

            {/* Tokenized chips */}
            {tokens.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-parchment-dim text-[11px]">Tokens:</span>
                {tokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-night-800 border border-night-line text-brass text-[11px] font-mono rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập từ khóa kiểm thử (VD: Inverted Index, BM25, Information Retrieval...)"
                  className="w-full bg-night-800 border border-night-line rounded px-4 py-2.5 text-sm text-parchment placeholder-parchment-dim focus:outline-none focus:border-brass/70"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-brass hover:bg-brass-light text-night-950 text-xs font-semibold rounded flex items-center gap-1 transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Chạy đối chiếu</span>
                </button>
              </div>
            </div>

            {/* Preset Query Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-parchment-dim">
              <span>Gợi ý query:</span>
              {presetQueries.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    runParallelBenchmark(item, alpha, limit, beta);
                  }}
                  className={`px-2.5 py-1 rounded border transition text-xs ${
                    query === item
                      ? 'bg-brass/20 text-brass-light border-brass/50 font-semibold'
                      : 'bg-night-800 border-night-line text-parchment-muted hover:text-parchment'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Tunable Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4 border-t border-night-line">
              {/* Alpha slider */}
              <div className="space-y-1.5 bg-night-800 p-3 rounded border border-night-line">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-parchment-muted font-medium flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-lacquer-light" />
                    Trọng số Lexical (&alpha;):
                  </span>
                  <span className="font-mono font-bold text-lacquer-light text-sm">{alpha.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="w-full accent-lacquer cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-parchment-dim">
                  <span>100% TF-IDF</span>
                  <span>Cân bằng</span>
                  <span>100% BM25</span>
                </div>
              </div>

              {/* Beta slider */}
              <div className="space-y-1.5 bg-night-800 p-3 rounded border border-night-line">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-parchment-muted font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-jade-light" />
                    Trọng số Semantic (&beta;):
                  </span>
                  <span className="font-mono font-bold text-jade-light text-sm">{beta.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-full accent-jade cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-parchment-dim">
                  <span>100% Lexical</span>
                  <span>Cân bằng</span>
                  <span>100% Semantic</span>
                </div>
              </div>

              {/* Limit selector */}
              <div className="space-y-1.5 bg-night-800 p-3 rounded border border-night-line">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-parchment-muted font-medium">Số lượng Top Docs (k):</span>
                  <span className="font-mono font-bold text-parchment text-sm">{limit} bài</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {[3, 5, 10, 15].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLimit(val)}
                      className={`flex-1 py-1 text-xs rounded border transition ${
                        limit === val
                          ? 'bg-brass/20 text-brass-light border-brass/60 font-semibold'
                          : 'bg-night-900 border-night-line text-parchment-dim hover:text-parchment'
                      }`}
                    >
                      Top {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Latency Overview */}
              <div className="space-y-1 bg-night-800 p-3 rounded border border-night-line text-xs">
                <span className="text-parchment-muted font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-jade-light" />
                  Độ trễ xử lý (Round-trip):
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="text-lacquer-light">Hybrid: <strong>{hybridTime}ms</strong></div>
                  <div className="text-brass">BM25: <strong>{bm25Time}ms</strong></div>
                  <div className="text-jade-light">TF-IDF: <strong>{tfidfTime}ms</strong></div>
                  <div className="text-jade">Semantic: <strong>{semanticTime}ms</strong></div>
                  <div className="text-parchment-dim col-span-2">SQL LIKE: <strong>{sqlTime}ms</strong></div>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* 4-Column Parallel Benchmark Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-serif text-lg text-parchment flex items-center gap-2">
              <Layers className="w-4 h-4 text-lacquer" />
              <span>Bảng Đối chiếu Song song 4 Cách Xếp hạng Backend</span>
            </h2>
            <span className="text-xs text-parchment-dim font-mono">
              Query: &quot;{query}&quot; | Hiển thị: Top {limit}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Column 1: HYBRID */}
            <div className="bg-night-900 border-2 border-lacquer/40 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-lacquer/10 border-b border-lacquer/30 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-lacquer-light uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" /> 1. Hybrid Scorer
                  </span>
                  <span className="text-[10px] bg-lacquer/20 text-lacquer-light px-2 py-0.5 rounded font-mono font-bold">
                    &alpha;={alpha}
                  </span>
                </div>
                <p className="text-[11px] text-parchment-muted mt-1 leading-snug">
                  Lai ghép chuẩn hóa Min-Max giữa BM25 và TF-IDF.
                </p>
              </div>

              <div className="p-3 space-y-3 flex-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Đang tính điểm Hybrid...</div>
                ) : hybridResults.length === 0 ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Không có kết quả.</div>
                ) : (
                  hybridResults.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectDoc && onSelectDoc(item.id)}
                      className="bg-night-800 hover:bg-night-700 border border-night-line hover:border-lacquer/50 p-3 rounded transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-lacquer-light">#{idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] bg-lacquer/20 text-lacquer-light px-1.5 py-0.5 rounded font-bold">
                            Score {item.score}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-serif font-semibold text-parchment line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-parchment-dim line-clamp-2">{item.snippet || item.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: OKAPI BM25 */}
            <div className="bg-night-900 border border-brass/40 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-brass/10 border-b border-brass/30 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-brass-light uppercase tracking-wide">
                    <Zap className="w-3.5 h-3.5" /> 2. Okapi BM25
                  </span>
                  <span className="text-[10px] bg-brass/20 text-brass-light px-2 py-0.5 rounded font-mono">
                    k1=1.5, b=0.75
                  </span>
                </div>
                <p className="text-[11px] text-parchment-muted mt-1 leading-snug">
                  Bão hòa tần suất từ & chuẩn hóa độ dài tài liệu.
                </p>
              </div>

              <div className="p-3 space-y-3 flex-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Đang tính điểm BM25...</div>
                ) : bm25Results.length === 0 ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Không có kết quả.</div>
                ) : (
                  bm25Results.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectDoc && onSelectDoc(item.id)}
                      className="bg-night-800 hover:bg-night-700 border border-night-line hover:border-brass/50 p-3 rounded transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-brass">#{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          {renderRankShift(idx + 1, item.hybrid_rank)}
                          <span className="font-mono text-[11px] bg-brass/20 text-brass-light px-1.5 py-0.5 rounded font-bold">
                            {item.score}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-serif font-semibold text-parchment line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-parchment-dim line-clamp-2">{item.snippet || item.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: TF-IDF */}
            <div className="bg-night-900 border border-jade/40 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-jade/10 border-b border-jade/30 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-jade-light uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5" /> 3. TF-IDF
                  </span>
                  <span className="text-[10px] bg-jade/20 text-jade-light px-2 py-0.5 rounded font-mono">
                    Log-scaled
                  </span>
                </div>
                <p className="text-[11px] text-parchment-muted mt-1 leading-snug">
                  Đo lường tần suất từ kết hợp nghịch đảo tần số văn bản.
                </p>
              </div>

              <div className="p-3 space-y-3 flex-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Đang tính điểm TF-IDF...</div>
                ) : tfidfResults.length === 0 ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Không có kết quả.</div>
                ) : (
                  tfidfResults.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectDoc && onSelectDoc(item.id)}
                      className="bg-night-800 hover:bg-night-700 border border-night-line hover:border-jade/50 p-3 rounded transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-jade-light">#{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          {renderRankShift(idx + 1, item.hybrid_rank)}
                          <span className="font-mono text-[11px] bg-jade/20 text-jade-light px-1.5 py-0.5 rounded font-bold">
                            {item.score}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-serif font-semibold text-parchment line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-parchment-dim line-clamp-2">{item.snippet || item.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 4: SEMANTIC EMBEDDING */}
            <div className="bg-night-900 border border-jade/40 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-jade/10 border-b border-jade/30 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-jade uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" /> 4. Semantic
                  </span>
                  <span className="text-[10px] bg-jade/20 text-jade px-2 py-0.5 rounded font-mono">
                    Cosine Sim.
                  </span>
                </div>
                <p className="text-[11px] text-parchment-muted mt-1 leading-snug">
                  Dense retrieval bằng vector embedding, bắt được ý nghĩa dù không trùng từ khóa.
                </p>
              </div>

              <div className="p-3 space-y-3 flex-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Đang tính Cosine Similarity...</div>
                ) : !healthInfo?.semantic_ready ? (
                  <div className="py-12 text-center text-xs text-parchment-dim px-2">
                    Semantic chưa sẵn sàng. Hãy "Rebuild Index" sau khi service đã nạp xong mô hình embedding.
                  </div>
                ) : semanticResults.length === 0 ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Không có kết quả.</div>
                ) : (
                  semanticResults.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectDoc && onSelectDoc(item.id)}
                      className="bg-night-800 hover:bg-night-700 border border-night-line hover:border-jade/50 p-3 rounded transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-jade">#{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          {renderRankShift(idx + 1, item.hybrid_rank)}
                          <span className="font-mono text-[11px] bg-jade/20 text-jade px-1.5 py-0.5 rounded font-bold">
                            {item.score}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-serif font-semibold text-parchment line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-parchment-dim line-clamp-2">{item.snippet || item.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 5: POSTGRESQL SQL LIKE */}
            <div className="bg-night-900 border border-night-line rounded-lg overflow-hidden flex flex-col">
              <div className="bg-night-800 border-b border-night-line p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-parchment-muted uppercase tracking-wide">
                    <Database className="w-3.5 h-3.5" /> 5. SQL LIKE (DB)
                  </span>
                  <span className="text-[10px] bg-night-700 text-parchment-dim px-2 py-0.5 rounded font-mono">
                    Baseline
                  </span>
                </div>
                <p className="text-[11px] text-parchment-muted mt-1 leading-snug">
                  Truy vấn chuỗi con ILIKE chuẩn (không tính điểm liên quan).
                </p>
              </div>

              <div className="p-3 space-y-3 flex-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Đang query PostgreSQL...</div>
                ) : sqlResults.length === 0 ? (
                  <div className="py-12 text-center text-xs text-parchment-dim">Không có kết quả.</div>
                ) : (
                  sqlResults.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectDoc && onSelectDoc(item.id)}
                      className="bg-night-800 hover:bg-night-700 border border-night-line hover:border-parchment/40 p-3 rounded transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-parchment-muted">#{idx + 1}</span>
                        <span className="text-[10px] text-parchment-dim">DB Match</span>
                      </div>
                      <h4 className="text-xs font-serif font-semibold text-parchment line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-parchment-dim line-clamp-2">{item.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dive Diagnostic Workbench */}
        <section className="bg-night-900 border border-night-line rounded-lg overflow-hidden">
          <div className="border-b border-night-line flex items-center justify-between p-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brass" />
              <h3 className="font-serif text-sm font-semibold text-parchment">
                Phân tích Chuyên sâu Cơ chế Tính toán (Deep-Dive Diagnostics)
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-night-800 p-1 rounded border border-night-line text-xs">
              <button
                type="button"
                onClick={() => setActiveSubTab('tokens')}
                className={`px-3 py-1 rounded transition font-medium ${
                  activeSubTab === 'tokens'
                    ? 'bg-brass text-night-950 font-bold'
                    : 'text-parchment-dim hover:text-parchment'
                }`}
              >
                Phân rã Token (IDF / TF)
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('rank_shift')}
                className={`px-3 py-1 rounded transition font-medium ${
                  activeSubTab === 'rank_shift'
                    ? 'bg-brass text-night-950 font-bold'
                    : 'text-parchment-dim hover:text-parchment'
                }`}
              >
                Ma trận Rank Shift
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('math')}
                className={`px-3 py-1 rounded transition font-medium ${
                  activeSubTab === 'math'
                    ? 'bg-brass text-night-950 font-bold'
                    : 'text-parchment-dim hover:text-parchment'
                }`}
              >
                Lý thuyết & Công thức
              </button>
            </div>
          </div>

          <div className="p-5">
            {/* SubTab 1: Token Breakdown */}
            {activeSubTab === 'tokens' && (
              <div className="space-y-4">
                <div className="text-xs text-parchment-muted flex items-center gap-2">
                  <Info className="w-4 h-4 text-jade shrink-0" />
                  <span>
                    Bảng phân tích trọng số và độ hiếm (IDF) của từng từ trong truy vấn đối với tài liệu Top 1 Hybrid.
                  </span>
                </div>

                {hybridResults.length > 0 && hybridResults[0].token_breakdown ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-night-line">
                      <thead className="bg-night-800 text-parchment-dim uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Từ vựng (Token)</th>
                          <th className="p-2.5">Nghịch đảo tần số (IDF)</th>
                          <th className="p-2.5">Tần suất trong Doc (TF)</th>
                          <th className="p-2.5">Điểm đóng góp</th>
                          <th className="p-2.5">Tỷ lệ đóng góp (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-night-line">
                        {hybridResults[0].token_breakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-night-800/50">
                            <td className="p-2.5 font-mono font-bold text-brass">{item.term}</td>
                            <td className="p-2.5 font-mono">{item.idf}</td>
                            <td className="p-2.5 font-mono">{item.tf}</td>
                            <td className="p-2.5 font-mono font-bold text-lacquer-light">{item.score_contrib}</td>
                            <td className="p-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-night-800 h-2 rounded overflow-hidden">
                                  <div
                                    className="bg-brass h-full"
                                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="font-mono text-[11px] text-parchment-muted">{item.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-parchment-dim py-4">Chưa có dữ liệu phân rã token.</p>
                )}
              </div>
            )}

            {/* SubTab 2: Rank Shift Matrix */}
            {activeSubTab === 'rank_shift' && (
              <div className="space-y-4">
                <div className="text-xs text-parchment-muted">
                  Bảng so sánh vị trí thứ hạng của các tài liệu khi chuyển đổi giữa BM25, TF-IDF, Semantic và Hybrid.
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-night-line">
                    <thead className="bg-night-800 text-parchment-dim uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Tên bài viết</th>
                        <th className="p-2.5">Hạng Hybrid</th>
                        <th className="p-2.5">Hạng BM25</th>
                        <th className="p-2.5">Hạng TF-IDF</th>
                        <th className="p-2.5">Hạng Semantic</th>
                        <th className="p-2.5">Biến thiên (Shift)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-night-line">
                      {hybridResults.map((doc, idx) => (
                        <tr key={doc.id} className="hover:bg-night-800/50">
                          <td className="p-2.5 font-serif font-medium text-parchment max-w-sm truncate">
                            {doc.title}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-lacquer-light">#{idx + 1}</td>
                          <td className="p-2.5 font-mono text-brass">#{doc.bm25_rank || idx + 1}</td>
                          <td className="p-2.5 font-mono text-jade-light">#{doc.tfidf_rank || idx + 1}</td>
                          <td className="p-2.5 font-mono text-jade">#{doc.semantic_rank || idx + 1}</td>
                          <td className="p-2.5">
                            {renderRankShift(idx + 1, doc.tfidf_rank)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SubTab 3: Math & Theory */}
            {activeSubTab === 'math' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 text-xs text-parchment-muted">
                <div className="p-4 bg-night-800 border border-night-line rounded space-y-2">
                  <h4 className="font-serif font-bold text-lacquer-light text-sm">🌟 Thuật toán Hybrid</h4>
                  <p className="leading-relaxed">
                    Trộn thành phần lexical (BM25/TF-IDF) với thành phần semantic theo trọng số &alpha; và &beta;:
                  </p>
                  <div className="bg-night-900 p-2 font-mono text-[11px] text-parchment rounded border border-night-line">
                    Lexical = &alpha;&middot;BM25_norm + (1-&alpha;)&middot;TFIDF_norm
                    <br />
                    Hybrid = &beta;&middot;Semantic_norm + (1-&beta;)&middot;Lexical
                  </div>
                  <p className="text-[11px] text-parchment-dim">
                    Đạt độ chính xác cao nhất nhờ kết hợp độ bão hòa của BM25, khả năng bắt từ khóa hiếm của TF-IDF và ngữ nghĩa từ embedding.
                  </p>
                </div>

                <div className="p-4 bg-night-800 border border-night-line rounded space-y-2">
                  <h4 className="font-serif font-bold text-brass text-sm">⚡ Okapi BM25</h4>
                  <p className="leading-relaxed">
                    Công thức xác suất phi tuyến với tham số bão hòa k1=1.5 và phạt độ dài b=0.75:
                  </p>
                  <div className="bg-night-900 p-2 font-mono text-[11px] text-parchment rounded border border-night-line">
                    BM25 = IDF &middot; [f(q,D)&middot;(k1+1)] / [f(q,D) + k1&middot;(1-b + b&middot;|D|/avgdl)]
                  </div>
                  <p className="text-[11px] text-parchment-dim">
                    Ngăn chặn tình trạng nhồi nhét từ khóa làm sai lệch kết quả xếp hạng.
                  </p>
                </div>

                <div className="p-4 bg-night-800 border border-night-line rounded space-y-2">
                  <h4 className="font-serif font-bold text-jade-light text-sm">📈 Log-scaled TF-IDF</h4>
                  <p className="leading-relaxed">
                    Phương pháp kinh điển đo lường tầm quan trọng của từ vựng theo logarit:
                  </p>
                  <div className="bg-night-900 p-2 font-mono text-[11px] text-parchment rounded border border-night-line">
                    TF-IDF = (1 + ln(tf)) &middot; ln(1 + N/df)
                  </div>
                  <p className="text-[11px] text-parchment-dim">
                    Đơn giản, tính toán nhanh nhưng thường thiên vị các văn bản có độ dài lớn.
                  </p>
                </div>

                <div className="p-4 bg-night-800 border border-night-line rounded space-y-2">
                  <h4 className="font-serif font-bold text-jade text-sm">🧠 Semantic Embedding</h4>
                  <p className="leading-relaxed">
                    Dense retrieval: so khớp theo ý nghĩa bằng Cosine Similarity giữa vector câu truy vấn và vector tài liệu.
                  </p>
                  <div className="bg-night-900 p-2 font-mono text-[11px] text-parchment rounded border border-night-line">
                    sim(q, D) = (v_q &middot; v_D) / (||v_q|| &middot; ||v_D||)
                  </div>
                  <p className="text-[11px] text-parchment-dim">
                    Tìm được tài liệu liên quan dù không trùng từ khóa, nhưng không tách điểm được theo từng token.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
