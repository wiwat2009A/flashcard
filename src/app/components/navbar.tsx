export default function Navbar() {
  const Link = [{ name: "Add", url: "/add" }];
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl" href="/">
          Remem B R A I N
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>Funciton</summary>
              <ul className="bg-base-100 rounded-t-none p-2">
                {Link.map((link) => (
                  <li key={link.name}>
                    <a href={link.url}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  );
}
