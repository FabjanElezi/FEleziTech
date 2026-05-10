'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Users, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Flight {
  id: number;
  destination: string;
  departureTime: string;
  price: string;
  seats: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface Reservation {
  id: number;
  customer: Customer;
  flight: Flight;
}

type View = 'menu' | 'flights' | 'booking';

// ── Seed data (matches the Java app exactly) ───────────────────────────────────

const INITIAL_FLIGHTS: Flight[] = [
  { id: 1, destination: 'Paris, France',      departureTime: '09:00 AM', price: '$450', seats: 120 },
  { id: 2, destination: 'London, UK',          departureTime: '11:30 AM', price: '$380', seats:  85 },
  { id: 3, destination: 'New York, USA',       departureTime: '02:15 PM', price: '$720', seats: 200 },
  { id: 4, destination: 'Dubai, UAE',          departureTime: '06:00 PM', price: '$560', seats: 150 },
  { id: 5, destination: 'Tokyo, Japan',        departureTime: '08:45 PM', price: '$890', seats:  60 },
  { id: 6, destination: 'Barcelona, Spain',    departureTime: '03:30 PM', price: '$410', seats:  95 },
  { id: 7, destination: 'Sydney, Australia',   departureTime: '10:00 PM', price: '$980', seats:  45 },
];

// ── Shared styles ──────────────────────────────────────────────────────────────

const panel: React.CSSProperties = {
  minHeight: '100vh',
  background: '#08143b',
  display: 'flex',
  flexDirection: 'column',
};

const header: React.CSSProperties = {
  background: '#0c1c41',
  borderBottom: '1px solid rgba(212,175,55,0.2)',
  padding: '18px 28px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const goldTitle: React.CSSProperties = {
  color: '#d4af37',
  fontWeight: 700,
  fontSize: 20,
};

const backBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(212,175,55,0.35)',
  color: '#d4af37',
  padding: '6px 14px',
  borderRadius: 6,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  marginLeft: 'auto',
  transition: 'all 0.2s',
};

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: { duration: 0.22 },
};

// ── Root App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]             = useState<View>('menu');
  const [flights, setFlights]       = useState<Flight[]>(INITIAL_FLIGHTS);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [nextCustId, setNextCustId] = useState(1);
  const [nextResId,  setNextResId]  = useState(1);

  function addCustomer(name: string, email: string): Customer {
    const c: Customer = { id: nextCustId, name, email };
    setCustomers((prev) => [...prev, c]);
    setNextCustId((n) => n + 1);
    return c;
  }

  function addReservation(customer: Customer, flight: Flight): Reservation {
    const r: Reservation = { id: nextResId, customer, flight };
    setReservations((prev) => [...prev, r]);
    setNextResId((n) => n + 1);
    setFlights((prev) =>
      prev.map((f) => (f.id === flight.id ? { ...f, seats: f.seats - 1 } : f))
    );
    return r;
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'menu' && (
        <motion.div key="menu" {...fade}>
          <MenuView onNavigate={setView} />
        </motion.div>
      )}
      {view === 'flights' && (
        <motion.div key="flights" {...fade}>
          <FlightsView flights={flights} onBack={() => setView('menu')} />
        </motion.div>
      )}
      {view === 'booking' && (
        <motion.div key="booking" {...fade}>
          <BookingView
            flights={flights}
            customers={customers}
            onBack={() => setView('menu')}
            onAddCustomer={addCustomer}
            onReserve={addReservation}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Menu View ──────────────────────────────────────────────────────────────────

function MenuView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div style={{ ...panel, alignItems: 'center', justifyContent: 'center' }}>
      {/* Decorative background rings */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 600, height: 600, borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(212,175,55,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 900, height: 900, borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(212,175,55,0.04)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', maxWidth: 480, padding: '0 24px' }}>
        {/* Logo / icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 8 }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #1652aa, #76419e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(22,82,170,0.4)',
          }}>
            <Plane size={36} color="#d4af37" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ fontSize: 42, fontWeight: 700, color: '#d4af37', marginBottom: 6, letterSpacing: '-0.5px' }}
        >
          Lucky 7 Flights
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: '#506090', fontSize: 13, marginBottom: 48 }}
        >
          Programming II Project
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <MenuButton
            label="View Flights"
            icon={<Plane size={18} />}
            color="#1652aa"
            hoverColor="#1a62c8"
            onClick={() => onNavigate('flights')}
          />
          <MenuButton
            label="Book / Add Customer"
            icon={<Users size={18} />}
            color="#76419e"
            hoverColor="#8a50b8"
            onClick={() => onNavigate('booking')}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#2a3a60', fontSize: 11, marginTop: 48 }}
        >
          Lucky 7 Flights · Programming II Project
        </motion.p>
      </div>
    </div>
  );
}

function MenuButton({
  label, icon, color, hoverColor, onClick,
}: {
  label: string; icon: React.ReactNode; color: string; hoverColor: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '16px 24px',
        background: hovered ? hoverColor : color,
        color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
        fontSize: 15, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all 0.2s',
        boxShadow: hovered ? `0 8px 24px ${color}55` : `0 2px 8px ${color}33`,
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      {icon} {label}
    </button>
  );
}

// ── Flights View ───────────────────────────────────────────────────────────────

function FlightsView({ flights, onBack }: { flights: Flight[]; onBack: () => void }) {
  const cols = ['#', 'Destination', 'Departure', 'Price', 'Seats Left'];

  return (
    <div style={panel}>
      <div style={header}>
        <Plane size={20} color="#d4af37" />
        <span style={goldTitle}>Available Flights</span>
        <button style={backBtn} onClick={onBack} onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.1)';
        }} onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}>
          <ArrowLeft size={14} /> Back to Menu
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px 28px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={{ background: '#122464' }}>
              {cols.map((c) => (
                <th key={c} style={{
                  padding: '14px 16px', textAlign: 'left',
                  color: '#d4af37', fontWeight: 700, fontSize: 13,
                  borderBottom: '2px solid rgba(212,175,55,0.25)',
                  letterSpacing: '0.04em',
                }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flights.map((f, i) => (
              <motion.tr
                key={f.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: i % 2 === 0 ? '#0e1e3e' : '#0a1730', cursor: 'default' }}
              >
                <td style={td}>{f.id}</td>
                <td style={{ ...td, fontWeight: 600, color: '#e8d68a' }}>{f.destination}</td>
                <td style={td}>{f.departureTime}</td>
                <td style={{ ...td, color: '#48c774', fontWeight: 600 }}>{f.price}</td>
                <td style={td}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: f.seats <= 10 ? 'rgba(220,72,72,0.15)' : f.seats <= 50 ? 'rgba(212,175,55,0.12)' : 'rgba(72,199,116,0.12)',
                    color: f.seats <= 10 ? '#dc4848' : f.seats <= 50 ? '#d4af37' : '#48c774',
                    border: `1px solid ${f.seats <= 10 ? 'rgba(220,72,72,0.3)' : f.seats <= 50 ? 'rgba(212,175,55,0.25)' : 'rgba(72,199,116,0.25)'}`,
                  }}>
                    {f.seats}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <p style={{ color: '#2a3a60', fontSize: 12, marginTop: 20, textAlign: 'right' }}>
          {flights.length} flights available
        </p>
      </div>
    </div>
  );
}

const td: React.CSSProperties = {
  padding: '14px 16px', fontSize: 14, color: '#c8d8f0',
  borderBottom: '1px solid rgba(32,62,115,0.5)',
};

// ── Booking View ───────────────────────────────────────────────────────────────

function BookingView({
  flights, customers, onBack, onAddCustomer, onReserve,
}: {
  flights: Flight[];
  customers: Customer[];
  onBack: () => void;
  onAddCustomer: (name: string, email: string) => Customer;
  onReserve: (c: Customer, f: Flight) => Reservation;
}) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [selCust,   setSelCust]   = useState<number>(-1);
  const [selFlight, setSelFlight] = useState<number>(-1);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  function saveCustomer() {
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setStatus({ msg: 'Please enter a valid name and email address.', ok: false });
      return;
    }
    const c = onAddCustomer(name.trim(), email.trim());
    setStatus({ msg: `Customer #${c.id} saved!`, ok: true });
    setName('');
    setEmail('');
    setSelCust(c.id);
  }

  function confirmBooking() {
    const c = customers.find((x) => x.id === selCust);
    const f = flights.find((x) => x.id === selFlight);
    if (!c) { setStatus({ msg: 'No customers yet — add one first.', ok: false }); return; }
    if (!f) { setStatus({ msg: 'Please select a flight.', ok: false }); return; }
    if (f.seats <= 0) { setStatus({ msg: 'This flight is fully booked.', ok: false }); return; }
    const r = onReserve(c, f);
    setStatus({ msg: `Booking confirmed! Reservation #${r.id}`, ok: true });
    setSelFlight(-1);
  }

  return (
    <div style={panel}>
      <div style={header}>
        <Users size={20} color="#d4af37" />
        <span style={goldTitle}>Book a Flight</span>
        <button style={backBtn} onClick={onBack} onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.1)';
        }} onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}>
          <ArrowLeft size={14} /> Back to Menu
        </button>
      </div>

      <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, width: '100%', margin: '0 auto' }}>

        {/* Status message */}
        <AnimatePresence>
          {status && (
            <motion.div
              key={status.msg}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 8,
                background: status.ok ? 'rgba(72,199,116,0.1)' : 'rgba(220,72,72,0.1)',
                border: `1px solid ${status.ok ? 'rgba(72,199,116,0.3)' : 'rgba(220,72,72,0.3)'}`,
                color: status.ok ? '#48c774' : '#dc4848',
                fontSize: 14, fontWeight: 600,
              }}
            >
              {status.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {status.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Customer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={card}
        >
          <h2 style={sectionTitle}>Add Customer</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={label}>Full Name</label>
              <input
                style={input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fabjan Elezi"
                onKeyDown={(e) => e.key === 'Enter' && saveCustomer()}
              />
            </div>
            <div>
              <label style={label}>Email Address</label>
              <input
                style={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. fabjan@example.com"
                onKeyDown={(e) => e.key === 'Enter' && saveCustomer()}
              />
            </div>
          </div>
          <ActionButton label="Save Customer" color="#1c8048" hoverColor="#22a05a" onClick={saveCustomer} />
        </motion.div>

        {/* Make Reservation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={card}
        >
          <h2 style={sectionTitle}>Make Reservation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={label}>Select Customer</label>
              <select
                style={input}
                value={selCust}
                onChange={(e) => setSelCust(Number(e.target.value))}
              >
                <option value={-1} disabled>
                  {customers.length === 0 ? 'Add a customer first' : '— select customer —'}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>#{c.id} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={label}>Select Flight</label>
              <select
                style={input}
                value={selFlight}
                onChange={(e) => setSelFlight(Number(e.target.value))}
              >
                <option value={-1} disabled>— select flight —</option>
                {flights.map((f) => (
                  <option key={f.id} value={f.id} disabled={f.seats === 0}>
                    {f.id}. {f.destination} · {f.departureTime} · {f.price}
                    {f.seats === 0 ? ' (FULL)' : ` (${f.seats} seats)`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ActionButton label="Confirm Booking" color="#76419e" hoverColor="#8a50b8" onClick={confirmBooking} />
        </motion.div>

      </div>
    </div>
  );
}

function ActionButton({ label, color, hoverColor, onClick }: {
  label: string; color: string; hoverColor: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginTop: 16, padding: '11px 22px',
        background: hovered ? hoverColor : color,
        color: '#fff', border: 'none', borderRadius: 8,
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: hovered ? `0 6px 20px ${color}55` : 'none',
      }}
    >
      {label}
    </button>
  );
}

// ── Shared card/form styles ────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#0c1c41',
  border: '1px solid rgba(212,175,55,0.12)',
  borderRadius: 12,
  padding: '24px',
};

const sectionTitle: React.CSSProperties = {
  color: '#d4af37',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 16,
  paddingBottom: 10,
  borderBottom: '1px solid rgba(212,175,55,0.12)',
};

const label: React.CSSProperties = {
  display: 'block',
  color: '#b4c8e6',
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  letterSpacing: '0.04em',
};

const input: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 7,
  color: '#e2e8f0',
  padding: '10px 12px',
  fontSize: 14,
  outline: 'none',
  appearance: 'none',
};
