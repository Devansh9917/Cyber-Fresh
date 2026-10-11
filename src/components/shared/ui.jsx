import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Badge({ children, color = 'green' }) {
    const colors = {
        green: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30',
        orange: 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
        yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30',
        red: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
        gray: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/30',
        blue: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    };
    return _jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`, children: children });
}
export function StatCard({ icon, label, value, sub, color = '#2E7D32', bg = '#E8F5E9' }) {
    return (_jsxs("div", { className: "glass rounded-2xl p-5 flex items-center gap-4", children: [_jsx("div", { className: "stat-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", style: { background: bg }, children: _jsx("span", { style: { color }, children: icon }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-semibold", children: label }), _jsx("p", { className: "text-2xl font-black text-gray-900 dark:text-gray-100 font-display", children: value }), sub && _jsx("p", { className: "text-xs text-green-700 dark:text-green-400 font-semibold mt-0.5", children: sub })] })] }));
}
export function FreshnessBadge({ score, t = (value) => value }) {
    let label = 'Excellent';
    let cls = 'freshness-excellent';
    if (score >= 85) {
        label = 'Excellent';
        cls = 'freshness-excellent';
    }
    else if (score >= 70) {
        label = 'Good';
        cls = 'freshness-good';
    }
    else if (score >= 50) {
        label = 'Fair';
        cls = 'freshness-fair';
    }
    else {
        label = 'Poor';
        cls = 'freshness-poor';
    }
    return (_jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cls}`, children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-current inline-block" }), t(label)] }));
}
export function FreshnessRing({ score }) {
    const r = 20;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 85 ? '#2E7D32' : score >= 70 ? '#558B2F' : score >= 50 ? '#F57F17' : '#E65100';
    return (_jsxs("div", { className: "relative inline-flex items-center justify-center", children: [_jsxs("svg", { width: "52", height: "52", className: "-rotate-90", children: [_jsx("circle", { cx: "26", cy: "26", r: r, fill: "none", stroke: "#E8F5E9", strokeWidth: "4" }), _jsx("circle", { cx: "26", cy: "26", r: r, fill: "none", stroke: color, strokeWidth: "4", strokeDasharray: `${dash} ${circ}`, strokeLinecap: "round", className: "transition-all duration-700" })] }), _jsx("span", { className: "absolute text-xs font-bold font-display", style: { color }, children: score })] }));
}
export function Input({ label, type = 'text', placeholder, value, onChange, icon, rightIcon, inputMode, maxLength }) {
    return (_jsxs("div", { className: "w-full", children: [label && _jsx("label", { className: "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5", children: label }), _jsxs("div", { className: "relative", children: [icon && _jsx("span", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500", children: icon }), _jsx("input", { type: type, inputMode: inputMode, maxLength: maxLength, placeholder: placeholder, value: value, onChange: e => onChange?.(e.target.value), className: `w-full border border-gray-200 dark:border-slate-700 rounded-xl py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${icon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'}` }), rightIcon && _jsx("span", { className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 cursor-pointer", children: rightIcon })] })] }));
}
export function Button({ children, variant = 'primary', size = 'md', onClick, full, disabled }) {
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
    const variants = {
        primary: 'btn-primary text-white font-semibold rounded-xl',
        secondary: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30 dark:hover:bg-green-500/20 font-semibold rounded-xl transition-all',
        orange: 'btn-orange text-white font-semibold rounded-xl',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/10 font-medium rounded-xl transition-all',
        outline: 'border border-gray-300 text-gray-700 hover:border-green-400 hover:text-green-700 dark:border-slate-600 dark:text-gray-300 dark:hover:border-green-500 dark:hover:text-green-400 font-semibold rounded-xl transition-all',
    };
    return (_jsx("button", { onClick: onClick, disabled: disabled, className: `inline-flex items-center justify-center gap-2 cursor-pointer ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`, children: children }));
}
export function SectionTitle({ children, sub }) {
    return (_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-gray-100 font-display", children: children }), sub && _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5", children: sub })] }));
}
export function EmptyState({ icon, title, sub }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-green-100 dark:bg-green-500/15 rounded-2xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400", children: icon }), _jsx("h3", { className: "text-lg font-bold text-gray-800 dark:text-gray-100 font-display", children: title }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium mt-1 max-w-xs", children: sub })] }));
}
export function Toast({ message, type = 'success', onClose }) {
    const colors = { success: 'bg-green-600', error: 'bg-red-500', info: 'bg-blue-500' };
    return (_jsxs("div", { className: `fixed bottom-6 right-6 z-50 ${colors[type]} text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 slide-in`, children: [_jsx("span", { className: "text-sm font-medium", children: message }), _jsx("button", { onClick: onClose, className: "opacity-70 hover:opacity-100 text-xs", children: "\u2715" })] }));
}
