import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AuthLayout from "./AuthLayout";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthFieldProps = {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  optional?: boolean;
};

function AuthField({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  optional = false,
}: AuthFieldProps) {
  return (
    <div>
      <label className="sport-label mb-1.5">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-text-muted">
            (nije obavezno)
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        aria-label={label}
        className="sport-input text-[15px]"
      />
    </div>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const { prijava } = useAuth();
  const navigate = useNavigate();

  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [potvrda, setPotvrda] = useState("");
  const [brojMobitela, setBrojMobitela] = useState("");
  const [greska, setGreska] = useState("");
  const [ucitavanje, setUcitavanje] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGreska("");

    if (!isLogin) {
      if (lozinka !== potvrda) {
        setGreska("Lozinke se ne podudaraju.");
        return;
      }

      if (lozinka.length < 6) {
        setGreska("Lozinka mora imati najmanje 6 znakova.");
        return;
      }
    }

    setUcitavanje(true);

    try {
      const endpoint = isLogin ? "prijava" : "registracija";

      const requestBody = isLogin
        ? { email, lozinka }
        : {
            ime,
            prezime,
            email,
            lozinka,
            brojMobitela: brojMobitela || undefined,
          };

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setGreska(
          data.greska ||
            (isLogin ? "Greška pri prijavi." : "Greška pri registraciji."),
        );
        return;
      }

      prijava(data.token, data.korisnik);
      navigate("/");
    } catch {
      setGreska("Nije moguće spojiti se na server.");
    } finally {
      setUcitavanje(false);
    }
  };

  return (
    <AuthLayout
      variant={mode}
      title={isLogin ? "Prijavi se" : "Registriraj se"}
      description={
        isLogin
          ? "Dobrodošao nazad u SportSpot"
          : "Stvori svoj SportSpot račun i pridruži nam se!"
      }
    >
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col ${isLogin ? "gap-[18px]" : "gap-4"}`}
      >
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3">
            <AuthField
              label="Ime"
              type="text"
              value={ime}
              onChange={setIme}
              placeholder="Marko"
              required
            />

            <AuthField
              label="Prezime"
              type="text"
              value={prezime}
              onChange={setPrezime}
              placeholder="Horvat"
              required
            />
          </div>
        )}

        <AuthField
          label="Email adresa"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={isLogin ? "ime@primjer.com" : "marko@primjer.com"}
          required
        />

        {!isLogin && (
          <AuthField
            label="Broj mobitela"
            type="tel"
            value={brojMobitela}
            onChange={setBrojMobitela}
            placeholder="+385 91 234 5678"
            optional
          />
        )}

        <AuthField
          label="Lozinka"
          type="password"
          value={lozinka}
          onChange={setLozinka}
          placeholder={isLogin ? "Unesite lozinku" : "Najmanje 6 znakova"}
          required
        />

        {!isLogin && (
          <AuthField
            label="Potvrda lozinke"
            type="password"
            value={potvrda}
            onChange={setPotvrda}
            placeholder="Ponovi lozinku"
            required
          />
        )}

        {greska && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-danger-border bg-danger-soft p-3.5 text-sm text-danger"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {greska}
          </div>
        )}

        <button
          type="submit"
          disabled={ucitavanje}
          className="btn-primary bg-brand-gradient w-full py-[13px] text-base shadow-sport-primary transition-opacity hover:opacity-90"
        >
          {ucitavanje
            ? isLogin
              ? "Prijavljujem..."
              : "Registriram..."
            : isLogin
              ? "Prijavi se"
              : "Registriraj se"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {isLogin ? "Nemaš račun? " : "Već imaš račun? "}
        <Link
          to={isLogin ? "/registracija" : "/prijava"}
          className="font-semibold text-primary no-underline hover:underline"
        >
          {isLogin ? "Registriraj se" : "Prijavi se"}
        </Link>
      </p>
    </AuthLayout>
  );
}
