import { useState } from "react";

type Fields = { name: string; email: string; password: string };
export default function FormValidation() {
  const [values, setValues] = useState<Fields>({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    name: values.name.trim().length < 2 ? "Enter at least two characters." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "Enter a valid email address.",
    password: values.password.length < 8 ? "Use at least eight characters." : "",
  };
  return <form className="mc-stack" noValidate onSubmit={e => { e.preventDefault(); setTouched({ name: true, email: true, password: true }); setSubmitted(!Object.values(errors).some(Boolean)); }}>
    <h3>Create a practice account</h3><p>Demo only. Nothing is sent or stored.</p>
    {(["name", "email", "password"] as const).map(field => <label key={field} className="mc-stack" htmlFor={`demo-${field}`}>
      <span className="mc-capitalize">{field}</span><input id={`demo-${field}`} type={field === "name" ? "text" : field} autoComplete={field === "password" ? "new-password" : field}
        value={values[field]} aria-invalid={!!(touched[field] && errors[field])} aria-describedby={touched[field] && errors[field] ? `error-${field}` : undefined}
        onBlur={() => setTouched(items => ({ ...items, [field]: true }))} onChange={e => { setValues(items => ({ ...items, [field]: e.target.value })); setSubmitted(false); }} />
      {touched[field] && errors[field] && <span id={`error-${field}`} className="mc-error">{errors[field]}</span>}
    </label>)}<button type="submit">Create account</button>{submitted && <p role="status">Validation passed. No account was actually created.</p>}
  </form>;
}
