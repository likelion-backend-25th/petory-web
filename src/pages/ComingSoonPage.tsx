interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-8">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-neutral-500">아직 준비 중인 메뉴입니다.</p>
    </section>
  );
}

export function ClubPage() {
  return <ComingSoonPage title="P클럽 찾기" />;
}

export function QnaPage() {
  return <ComingSoonPage title="QnA" />;
}

export function ChatPage() {
  return <ComingSoonPage title="채팅" />;
}

export function PaymentHistoryPage() {
  return <ComingSoonPage title="결제 내역" />;
}

export function SubscriptionPage() {
  return <ComingSoonPage title="구독 관리" />;
}
