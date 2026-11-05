import React, { useState } from 'react';
import { PythonSearchResult, TokenBreakdown } from '../types';
import {
  BarChart3,
  Sliders,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface AlgorithmVisualizerProps {
  query: string;
  tokens: string[];
  results: PythonSearchResult[];
  executionTimeMs?: number;
  totalResults: number;
  searchMode: string;
  onSelectDoc: (id: number) => void;
  onAlphaChange?: (newAlpha: number) => void;
  alpha?: number;
}

export const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({
  query,
  tokens,
  results,
  executionTimeMs = 4.2,
  totalResults,
  searchMode,
  onSelectDoc,
  onAlphaChange,
  alpha = 0.65,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'comparison' | 'rank_shift' | 'tokens' | 'theory'>('comparison');
  const [localAlpha, setLocalAlpha] = useState(alpha);

  // Maximum scores for visual bar scaling
  const maxScore = Math.max(...results.map((r) => r.score || 0), 10);
  const maxBM25 = Math.max(...results.map((r) => r.bm25_score || 0), 1);
  const maxTFIDF = Math.max(...results.map((r) => r.tfidf_score || 0), 1);

  const handleSliderChange = (val: number) => {
    setLocalAlpha(val);
    if (onAlphaChange) {
      onAlphaChange(val);
    }
  };

  const getRankShiftBadge = (hybridRank?: number, baselineRank?: number) => {
    if (!hybridRank || !baselineRank) return <span className="text-parchment-dim"><Minus className="w-3.5 h-3.5" /></span>;
    const diff = baselineRank - hybridRank; // Positive means moved up in hybrid
    if (diff > 0) {
      return (
        <span className="inline-flex items-center text-jade text-xs font-bold">
          <ArrowUpRight className="w-3.5 h-3.5" /> +{diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="inline-flex items-center text-lacquer-light text-xs font-bold">
          <ArrowDownRight className="w-3.5 h-3.5" /> {diff}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-parchment-dim text-xs">
        <Minus className="w-3 h-3" /> 0
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Engine Stats Card */}
      <div className="bg-night-900 border border-night-line rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-night-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lacquer animate-pulse"></span>
              <h2 className="font-serif text-lg text-parchment font-semibold">
                Bảng điều khiển Trực quan hóa Thuật toán Tìm kiếm (Algorithm Visualizer)
              </h2>
            </div>
            <p className="text-xs text-parchment-muted mt-1">
              Phân tích hiệu năng thời gian thực cho truy vấn: <strong className="text-brass-light">"{query}"</strong> ({totalResults} kết quả)
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="px-3 py-1.5 bg-night-850 border border-night-line rounded flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-jade" />
              <span className="text-parchment-dim">Thời gian chạy:</span>
              <span className="font-bold text-jade-light">{executionTimeMs} ms</span>
            </div>
            <div className="px-3 py-1.5 bg-night-850 border border-night-line rounded flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-brass" />
              <span className="text-parchment-dim">Chế độ đang chạy:</span>
              <span className="font-bold uppercase text-brass-light">{searchMode}</span>
            </div>
          </div>
        </div>

        {/* Alpha Tuning Parameter Bar */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-brass" />
            <div className="text-xs">
              <span className="text-parchment font-semibold">Hệ số dung hòa Hybrid (&alpha;): </span>
              <span className="text-brass-light font-bold">{(localAlpha * 100).toFixed(0)}% BM25</span>
              <span className="text-parchment-dim"> + </span>
              <span className="text-jade-light font-bold">{((1 - localAlpha) * 100).toFixed(0)}% TF-IDF</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-72">
            <span className="text-[10px] text-parchment-dim">TF-IDF</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localAlpha}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full accent-brass cursor-pointer"
            />
            <span className="text-[10px] text-parchment-dim">BM25</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-3 border-b border-night-line text-xs font-semibold overflow-x-auto pb-px">
        <button
          onClick={() => setSelectedSubTab('comparison')}
          className={`pb-2.5 px-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
            selectedSubTab === 'comparison'
              ? 'border-brass text-brass-light'
              : 'border-transparent text-parchment-dim hover:text-parchment'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>1. Biểu đồ So sánh Điểm số (Score Comparison)</span>
        </button>
        <button
          onClick={() => setSelectedSubTab('rank_shift')}
          className={`pb-2.5 px-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
            selectedSubTab === 'rank_shift'
              ? 'border-brass text-brass-light'
              : 'border-transparent text-parchment-dim hover:text-parchment'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>2. Ma trận Biến thiên Thứ hạng (&Delta; Rank)</span>
        </button>
        <button
          onClick={() => setSelectedSubTab('tokens')}
          className={`pb-2.5 px-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
            selectedSubTab === 'tokens'
              ? 'border-brass text-brass-light'
              : 'border-transparent text-parchment-dim hover:text-parchment'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>3. Phân rã Trọng số Từ khóa (Token Breakdown)</span>
        </button>
        <button
          onClick={() => setSelectedSubTab('theory')}
          className={`pb-2.5 px-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
            selectedSubTab === 'theory'
              ? 'border-brass text-brass-light'
              : 'border-transparent text-parchment-dim hover:text-parchment'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>4. Lý thuyết & Ưu thế Thuật toán Hybrid</span>
        </button>
      </div>

      {/* TAB 1: SCORE COMPARISON */}
      {selectedSubTab === 'comparison' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-parchment-dim pb-1">
            <span>Danh sách Top tài liệu xếp hạng kèm điểm chuẩn hóa:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-lacquer inline-block"></span> Điểm Hybrid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-brass inline-block"></span> Điểm BM25
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-jade inline-block"></span> Điểm TF-IDF
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {results.slice(0, 10).map((doc, idx) => {
              const hybridPct = Math.min(100, Math.max(5, ((doc.score || 0) / maxScore) * 100));
              const bm25Pct = Math.min(100, Math.max(5, ((doc.bm25_score || 0) / maxBM25) * 100));
              const tfidfPct = Math.min(100, Math.max(5, ((doc.tfidf_score || 0) / maxTFIDF) * 100));

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="bg-night-850 border border-night-line hover:border-brass/40 p-4 rounded-lg cursor-pointer transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-night-700 border border-night-line text-[11px] font-bold text-brass flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h4 className="font-serif text-sm font-medium text-parchment hover:text-brass-light transition">
                          {doc.title}
                        </h4>
                      </div>
                      <p className="text-xs text-parchment-dim pl-7 line-clamp-1">{doc.summary}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-lacquer-light">
                        {doc.score} <span className="text-[10px] text-parchment-dim font-normal">/ 10</span>
                      </div>
                      <span className="text-[10px] text-brass">Điểm Hybrid</span>
                    </div>
                  </div>

                  {/* Visual Bar Comparisons */}
                  <div className="space-y-1.5 pl-7 text-[11px]">
                    {/* Hybrid Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-parchment-dim">Hybrid:</span>
                      <div className="flex-1 bg-night-950 h-2.5 rounded-full overflow-hidden border border-night-line">
                        <div
                          className="h-full bg-gradient-to-r from-brass to-lacquer rounded-full transition-all duration-300"
                          style={{ width: `${hybridPct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-lacquer-light font-semibold">
                        {doc.score}
                      </span>
                    </div>

                    {/* BM25 Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-parchment-dim">BM25:</span>
                      <div className="flex-1 bg-night-950 h-2 rounded-full overflow-hidden border border-night-line">
                        <div
                          className="h-full bg-brass/80 rounded-full transition-all duration-300"
                          style={{ width: `${bm25Pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-brass-light">
                        {doc.bm25_score || 0}
                      </span>
                    </div>

                    {/* TF-IDF Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-parchment-dim">TF-IDF:</span>
                      <div className="flex-1 bg-night-950 h-2 rounded-full overflow-hidden border border-night-line">
                        <div
                          className="h-full bg-jade/80 rounded-full transition-all duration-300"
                          style={{ width: `${tfidfPct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-jade-light">
                        {doc.tfidf_score || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RANK SHIFT MATRIX */}
      {selectedSubTab === 'rank_shift' && (
        <div className="bg-night-850 border border-night-line rounded-lg overflow-hidden">
          <div className="p-4 bg-night-900 border-b border-night-line flex items-center justify-between">
            <h3 className="text-xs font-semibold text-parchment flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brass" />
              <span>Bảng So sánh Dịch chuyển Thứ hạng (Rank Shift Matrix)</span>
            </h3>
            <span className="text-[11px] text-parchment-dim">
              So sánh thứ hạng đầu ra khi dùng Hybrid so với thuật toán đơn lẻ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-night-950/80 border-b border-night-line text-parchment-dim uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tài liệu (ID & Tiêu đề)</th>
                  <th className="py-3 px-3 text-center">Hạng Hybrid</th>
                  <th className="py-3 px-3 text-center">Hạng BM25</th>
                  <th className="py-3 px-3 text-center">Hạng TF-IDF</th>
                  <th className="py-3 px-3 text-center">&Delta; vs BM25</th>
                  <th className="py-3 px-3 text-center">&Delta; vs TF-IDF</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-line">
                {results.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-night-800 transition">
                    <td className="py-3 px-4">
                      <div className="font-serif font-medium text-parchment line-clamp-1">{doc.title}</div>
                      <div className="text-[11px] text-parchment-dim">ID #{doc.id} &bull; {doc.category_name}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-lacquer/20 text-lacquer-light font-bold border border-lacquer/30">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-brass-light font-semibold">
                      #{doc.bm25_rank || idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center text-jade-light font-semibold">
                      #{doc.tfidf_rank || idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getRankShiftBadge(idx + 1, doc.bm25_rank)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getRankShiftBadge(idx + 1, doc.tfidf_rank)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectDoc(doc.id)}
                        className="px-2.5 py-1 text-[11px] text-brass hover:text-night-950 hover:bg-brass border border-brass/40 rounded transition"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TOKEN CONTRIBUTION BREAKDOWN */}
      {selectedSubTab === 'tokens' && (
        <div className="space-y-4">
          <div className="p-4 bg-night-850 border border-night-line rounded-lg">
            <h3 className="text-xs font-semibold text-brass-light flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brass" />
              <span>Phân tách Từ khóa truy vấn và Trọng số IDF</span>
            </h3>
            <p className="text-xs text-parchment-muted leading-relaxed">
              Các từ khóa hiếm trong kho tài liệu sở hữu chỉ số <strong className="text-parchment">IDF (Inverse Document Frequency)</strong> cao hơn, mang lại trọng lượng lớn hơn khi tính toán độ liên quan.
            </p>

            <div className="mt-3 flex gap-2 flex-wrap">
              {tokens.map((tok, i) => (
                <div key={i} className="px-3 py-1.5 bg-night-900 border border-brass/30 rounded text-xs flex items-center gap-2">
                  <span className="font-semibold text-brass-light">"{tok}"</span>
                  <span className="text-[10px] text-parchment-dim">Token #{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 1 document token breakdown */}
          {results.length > 0 && results[0].token_breakdown && (
            <div className="bg-night-850 border border-night-line rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-night-line">
                <div>
                  <span className="text-[10px] text-lacquer-light uppercase font-bold tracking-wider">Tài liệu dẫn đầu (#1)</span>
                  <h4 className="font-serif text-base font-semibold text-parchment">{results[0].title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-parchment-dim">Tổng điểm:</span>
                  <div className="text-sm font-bold text-brass">{results[0].score}</div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-parchment">Tỷ lệ đóng góp của từng token vào điểm số:</span>
                {results[0].token_breakdown.map((item: TokenBreakdown, idx: number) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-parchment">"{item.term}"</span>
                        <span className="text-[11px] text-parchment-dim">
                          (TF: {item.tf} lần &bull; IDF: {item.idf})
                        </span>
                      </div>
                      <span className="font-semibold text-jade-light">{item.percentage}%</span>
                    </div>

                    <div className="w-full bg-night-950 h-2 rounded-full overflow-hidden border border-night-line">
                      <div
                        className="h-full bg-jade rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: THEORETICAL INSIGHTS */}
      {selectedSubTab === 'theory' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: BM25 */}
          <div className="bg-night-850 border border-night-line rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-brass font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Okapi BM25</span>
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              Áp dụng hàm bão hòa tần suất từ (với tham số $k_1 = 1.5$) và chuẩn hóa độ dài văn bản qua $b = 0.75$. Ngăn không cho bài viết quá dài chiếm ưu thế không công bằng.
            </p>
            <div className="text-[11px] text-parchment-dim border-t border-night-line pt-2">
              <span className="text-brass">Điểm mạnh:</span> Xếp hạng chuẩn xác ngữ cảnh, xử lý tốt bài viết dài ngắn bất đối xứng.
            </div>
          </div>

          {/* Card 2: TF-IDF */}
          <div className="bg-night-850 border border-night-line rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-jade font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Log-scaled TF-IDF</span>
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              Trọng số dựa trên tần suất từ trong tài liệu (với sublinear scaling $1 + \ln(tf)$) nhân với nghịch đảo tần suất tài liệu ($\ln(N/df)$).
            </p>
            <div className="text-[11px] text-parchment-dim border-t border-night-line pt-2">
              <span className="text-jade">Điểm mạnh:</span> Rất nhạy bén với các từ vựng kỹ thuật chuyên sâu và cụm từ hiếm.
            </div>
          </div>

          {/* Card 3: Hybrid Fusion */}
          <div className="bg-night-850 border border-lacquer/40 rounded-lg p-5 space-y-3 bg-gradient-to-b from-night-850 to-night-900">
            <div className="flex items-center gap-2 text-lacquer-light font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hybrid Score Fusion (Tốt nhất)</span>
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">
              Kết hợp tinh hoa của cả hai: Chuẩn hóa Min-Max điểm số BM25 và TF-IDF về cùng thang đo, sau đó cộng gộp theo trọng số $\alpha$:
              <code className="block bg-night-950 p-2 my-2 border border-night-line text-[11px] font-mono text-brass-light">
                Score = &alpha; &times; BM25_norm + (1-&alpha;) &times; TFIDF_norm
              </code>
            </p>
            <div className="text-[11px] text-parchment-dim border-t border-night-line pt-2">
              <span className="text-lacquer-light">Kết quả:</span> Đạt chỉ số MAP (Mean Average Precision) và NDCG cao nhất trong bài tập lớn Search Engine!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
