import re
import unicodedata
from typing import List, Tuple

# Common domain compound words in Astrology & AI (sorted by length descending for greedy match)
DOMAIN_COMPOUNDS = [
    # AI & Search & NLP
    "machine learning", "deep learning", "prompt engineering", "chain of thought",
    "few shot", "zero shot", "large language model", "vector embedding",
    "inverted index", "knowledge graph", "decision tree", "random forest",
    "linear regression", "logistic regression", "hidden markov", "markov chain",
    "cross encoder", "dense retrieval", "sparse retrieval", "hybrid search",
    "tf idf", "bm25", "okapi bm25", "web assembly", "context window",
    "semantic chunking", "system prompt",

    # Tu Vi: 14 Chinh Tinh
    "tử vi", "thiên phủ", "vũ khúc", "thiên đồng", "liêm trinh", "thất sát",
    "phá quân", "tham lang", "thái dương", "thái âm", "thiên cơ", "thiên lương",
    "cự môn", "thiên tướng",

    # Tu Vi: 12 Cung
    "cung mệnh", "cung thân", "cung phụ mẫu", "cung phúc đức", "cung điền trạch",
    "cung quan lộc", "cung nô bộc", "cung thiên di", "cung tật ách", "cung tài bạch",
    "cung tử tức", "cung phu thê", "cung huynh đệ", "vô chính diệu",

    # Tu Vi: Tu Hoa & Sat Tinh & Cat Tinh
    "hóa khoa", "hóa quyền", "hóa lộc", "hóa kỵ",
    "địa không", "địa kiếp", "kình dương", "đà la", "hỏa tinh", "linh tinh",
    "văn xương", "văn khúc", "tả phù", "hữu bật", "thiên khôi", "thiên việt",
    "tuần không", "triệt không", "tang môn", "bạch hổ", "thiên mã", "đào hoa",
    "hồng loan", "thiên hỷ", "thiên giải", "địa giải", "hóa giải",

    # Tu Vi: Thuat ngu cach cuc & van han
    "tử phủ vũ tướng", "sát phá tham", "cơ nguyệt đồng lương", "cự nhật",
    "thạch trung ẩn ngọc", "mã đầu đới kiếm", "nhật nguyệt tịnh minh",
    "phản vi kỳ cách", "kình đà hiệp kỵ", "đắc tam không", "đào hoa phiếm chủy",
    "đại vận", "tiểu hạn", "lưu niên", "thái tuế", "nạp âm", "hoa giáp",
    "tiết khí", "giờ sinh", "an sao", "ngũ hành", "sinh khắc",
]

# Vietnamese stopwords for search engine
VIETNAMESE_STOPWORDS = {
    "và", "của", "là", "có", "được", "trong", "cho", "với", "các", "những",
    "về", "đến", "khi", "tại", "một", "này", "thì", "mà", "đã", "sẽ",
    "đang", "như", "ra", "để", "từ", "hay", "hoặc", "nhưng", "lại",
}

class VietnameseTokenizer:
    def __init__(self, filter_stopwords: bool = True):
        self.filter_stopwords = filter_stopwords
        # Compile regex for compound word replacement
        # Normalize compounds to snake_case so "tử vi" becomes single token "tử_vi"
        self.compound_map = {}
        patterns = []
        for term in sorted(DOMAIN_COMPOUNDS, key=lambda x: -len(x)):
            token_replacement = term.replace(" ", "_")
            self.compound_map[term] = token_replacement
            patterns.append(re.escape(term))
        self.compound_regex = re.compile(r'\b(' + '|'.join(patterns) + r')\b', re.IGNORECASE)

    def normalize(self, text: str) -> str:
        """Chuẩn hóa Unicode NFC và chữ thường."""
        if not text:
            return ""
        text = unicodedata.normalize("NFC", text)
        return text.lower()

    def tokenize(self, text: str) -> List[str]:
        """Tách từ kết hợp ghép từ ngữ chuyên ngành AI & Tử Vi."""
        norm_text = self.normalize(text)

        # Replace compound domain terms with snake_case
        def replace_compound(match):
            key = match.group(0).lower()
            return self.compound_map.get(key, key.replace(" ", "_"))

        processed_text = self.compound_regex.sub(replace_compound, norm_text)

        # Split on non-alphanumeric (except underscore)
        raw_tokens = re.split(r'[^\w_]+', processed_text)

        tokens = []
        for t in raw_tokens:
            t = t.strip('_')
            if not t or len(t) < 2:
                continue
            if self.filter_stopwords and t in VIETNAMESE_STOPWORDS:
                continue
            tokens.append(t)

        return tokens

    def tokenize_with_positions(self, text: str) -> List[Tuple[str, int]]:
        """Trả về danh sách (token, position) phục vụ Inverted Index."""
        tokens = self.tokenize(text)
        return [(tok, idx) for idx, tok in enumerate(tokens)]
