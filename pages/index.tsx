import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setFilteredData(data.filter(d => d.nom + ' ' + d.prenom === selectedUser));
    } else {
      setFilteredData(data);
    }
  }, [selectedUser, data]);

  const users = [...new Set(data.map(d => d.nom + ' ' + d.prenom))];

  const lineChartData = {
    labels: filteredData.map(p => new Date(p.time).toLocaleTimeString()),
    datasets: [
      {
        label: 'Gaz',
        data: filteredData.map(p => p.gaz),
        borderColor: 'red',
        fill: false,
      },
      {
        label: 'Fumée',
        data: filteredData.map(p => p.smoke),
        borderColor: 'blue',
        fill: false,
      },
    ],
  };

  const barData = {
    labels: users,
    datasets: [
      {
        label: 'Moyenne Gaz',
        data: users.map(u => {
          const uData = data.filter(d => d.nom + ' ' + d.prenom === u);
          return uData.reduce((a, b) => a + b.gaz, 0) / uData.length || 0;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Moyenne Fumée',
        data: users.map(u => {
          const uData = data.filter(d => d.nom + ' ' + d.prenom === u);
          return uData.reduce((a, b) => a + b.smoke, 0) / uData.length || 0;
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const exportCSV = () => {
    let csv = "temps,nom,prenom,tel,adresse,gaz,fumee\n";
    filteredData.forEach(p => {
      csv += `${p.time},${p.nom},${p.prenom},${p.tel},${p.adresse},${p.gaz},${p.smoke}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donnees.csv';
    a.click();
  };

  const printData = () => {
    const newWin = window.open();
    if (newWin) {
      newWin.document.write('<pre>' + JSON.stringify(filteredData, null, 2) + '</pre>');
      newWin.print();
      newWin.close();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Gaz & Fumée</h1>

      <div>
        <label className="mr-2">Sélectionner un utilisateur :</label>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="p-2 border rounded">
          <option value="">Tous</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Données en temps réel</h2>
        <Line data={lineChartData} />
      </div>

      <div>
        <h2 className="text-xl font-semibold">Statistiques Moyennes (Tous utilisateurs)</h2>
        <Bar data={barData} />
      </div>

      <div className="space-x-4">
        <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded">Exporter CSV</button>
        <button onClick={printData} className="bg-green-600 text-white px-4 py-2 rounded">Imprimer</button>
      </div>
    </div>
  );
}
