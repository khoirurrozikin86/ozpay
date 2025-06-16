"use client";

const stats = ["Projects", "Active Task", "Teams", "Productivity"];

export default function DashboardContent() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Projects</h1>

            {/* Stats */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 shadow">
                        <h2 className="text-lg font-semibold">{item}</h2>
                        <p className="text-2xl mt-2">123</p>
                    </div>
                ))}
            </div> */}

            {/* Active Projects Table */}
            {/* <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Hours</th>
                            <th>Priority</th>
                            <th>Members</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t">
                            <td>File Management App</td>
                            <td>34</td>
                            <td><span className="bg-yellow-200 text-yellow-800 p-1 rounded">Medium</span></td>
                            <td>+5</td>
                            <td>15%</td>
                        </tr>
                    </tbody>
                </table>
            </div> */}
        </div>
    );
}
