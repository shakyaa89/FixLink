import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import type { JobData } from "../../api/Apis";

const mockJob: JobData = {
  _id: "J-042",
  userId: "U-100",
  title: "Replace broken tiles in kitchen",
  description:
    "The kitchen floor has several broken tiles that need removal and replacement. Prefer someone experienced with tiling.",
  jobCategory: "Home Repair",
  userPrice: 120,
  location: "Colombo 7",
  locationURL: "https://maps.google.com/?q=Colombo+7",
  jobStatus: "Open",
  offers: ["Offer-1", "Offer-2"],
  createdAt: "2025-12-15",
  updatedAt: "2025-12-16",
};

const mockOffers = [
  {
    id: "Offer-1",
    providerName: "HandyFix Ltd",
    amount: "$110",
    message: "Can complete within 2 days. Include grout cleaning.",
    createdAt: "2025-12-16",
  },
  {
    id: "Offer-2",
    providerName: "TilePros",
    amount: "$120",
    message: "Experienced tilers, 3 years warranty on work.",
    createdAt: "2025-12-17",
  },
];

export default function JobDetailsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
            <p className="text-gray-600 mt-1">Details for service providers</p>
          </div>

          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {mockJob.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">ID: {mockJob._id}</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                {mockJob.jobStatus}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium">Category</p>
                <p className="text-gray-600">{mockJob.jobCategory}</p>
              </div>

              <div>
                <p className="font-medium">Budget</p>
                <p className="text-gray-600">${mockJob.userPrice}</p>
              </div>

              <div>
                <p className="font-medium">Location</p>
                <p className="text-gray-600">
                  <a
                    href={mockJob.locationURL}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {mockJob.location}
                  </a>
                </p>
              </div>

              <div>
                <p className="font-medium">Posted</p>
                <p className="text-gray-600">{mockJob.createdAt}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-medium">Description</p>
              <p className="text-gray-700 mt-2">{mockJob.description}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Cancel Job
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg">
                Contact User
              </button>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Offers</h3>

            <div className="grid grid-cols-1 gap-4">
              {mockOffers.map((o) => (
                <div
                  key={o.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{o.providerName}</p>
                      <p className="text-sm text-gray-600">{o.message}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">{o.amount}</p>
                      <p className="text-xs text-gray-500">{o.createdAt}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">
                      Accept
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-8 text-center text-gray-500">
            Last updated: {mockJob.updatedAt}
          </footer>
        </div>
      </main>
    </div>
  );
}
