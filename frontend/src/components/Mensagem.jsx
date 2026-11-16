export default function Mensagem({ mensagem }) {
  if (!mensagem) {
    return null;
  }
  return (
    <p className={`mensagem ${mensagem.tipo}`} role="status">
      {mensagem.texto}
    </p>
  );
}
