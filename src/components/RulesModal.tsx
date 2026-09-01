interface RulesModalProps {
  onClose: () => void;
}

const RULES: { title: string; desc: string }[] = [
  {
    title: "기본 배치",
    desc: "P1이 1개, P2가 2개, P1이 2개, P2가 1개 순서로 놓습니다. 정중앙 칸과 자신의 기존 돌에 인접한 칸에는 놓을 수 없습니다.",
  },
  { title: "돌 놓기", desc: "자신의 턴에 보유한 돌 1개를 빈 칸에 놓습니다. 쌓는 행동이 아닙니다." },
  { title: "돌 이동", desc: "이미 놓인 자신의 돌 중 맨 위에 노출된 돌 하나를 인접한 칸으로 옮깁니다." },
  { title: "최대 3층", desc: "한 칸에는 돌을 최대 3층까지만 쌓을 수 있습니다." },
  { title: "높은 칸으로 이동 불가", desc: "이동할 때 목적지 높이는 출발지 높이보다 높을 수 없습니다." },
  { title: "오목 승리", desc: "맨 위에 보이는 돌 기준, 정확히 5개가 일직선으로 연결되면 승리합니다. 6개 이상은 인정되지 않습니다." },
  { title: "3층 돌 5개 승리", desc: "자신의 돌이 3층에 놓인 칸이 5개 이상이면, 흩어져 있어도 승리합니다." },
  { title: "인접 3층 돌 3개 승리", desc: "3층에 놓인 자신의 돌 중 서로 인접한 3개가 하나의 무리를 이루면 승리합니다." },
];

export default function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel rules-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="게임 규칙"
      >
        <div className="modal-header">
          <h2>게임 규칙</h2>
          <button className="modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <ol className="rules-list">
          {RULES.map((rule) => (
            <li key={rule.title}>
              <span className="rule-title">{rule.title}</span>
              <span className="rule-desc">{rule.desc}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
