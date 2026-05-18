export default function Avatar({ name = 'User', size = 40, className = '' }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${'000000'.substring(0, 6 - color.length)}${color}`;
  };

  const color = stringToColor(name);

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: `${size * 0.4}px`,
    color: 'white',
    background: `linear-gradient(135deg, ${color}cc, ${color})`,
    border: '2px solid var(--bg-surface)',
    flexShrink: 0
  };

  return (
    <div style={style} className={className} title={name}>
      {getInitials(name)}
    </div>
  );
}
