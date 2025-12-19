import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { JobApi, type JobData } from "../../api/Apis";
import { useParams } from "react-router-dom";
import {
  Ban,
  Loader2,
  Inbox,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  Mail,
  Phone,
  Check,
} from "lucide-react";

export default function JobDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobData>();
  const { jobId } = useParams();

  const fetchJob = async () => {
    try {
      const response = await JobApi.fetchJobByIdApi(jobId!);

      setJob(response.data.job);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

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
                  {job?.title}
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium capitalize">
                {job?.jobStatus}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-gray-600">{job?.jobCategory}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-gray-600 text-2xl">Rs. {job?.userPrice}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">
                    <a
                      href={job?.locationURL}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {job?.location}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium">Posted</p>
                  <p className="text-gray-600">
                    {new Date(job?.createdAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" /> Description
              </p>
              <p className="text-gray-700 mt-2">{job?.description}</p>
            </div>

            <div className="mt-6 flex gap-3">
              {/* <button className="flex items-center gap-2 px-4 py-2 text-md bg-blue-600 text-white rounded-lg transition">
                <Edit className="w-4 h-4" />
                Edit Job
              </button> */}
              <button className="flex items-center gap-2 px-4 py-2 text-md bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                <Ban className="w-4 h-4" />
                Cancel Job
              </button>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <Inbox className="w-5 h-5 inline-block mr-2 text-gray-700" />
              Offers
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {job?.offers && job.offers.length > 0 ? (
                job.offers.map((offer) => {
                  const provider = offer.serviceProviderId;

                  return (
                    <div
                      key={offer._id}
                      className="bg-white border border-gray-200 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        {/* Provider Info */}
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">
                            {provider.fullName}
                          </p>

                          <p className="text-sm text-gray-600">
                            Category: {provider.providerCategory || "N/A"}
                          </p>
                        </div>

                        {/* Offer Info */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            Rs. {offer.offeredPrice}
                          </p>

                          <p className="text-xs text-gray-500">
                            {new Date(offer.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-4 text-sm text-gray-700 space-y-1">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-600" />{" "}
                          {provider.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-600" />{" "}
                          {provider.phoneNumber}
                        </p>
                        {provider.address && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-600" />{" "}
                            {provider.address}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-600">
                  <p className="text-lg font-medium">No offers yet</p>
                  <p className="text-sm">
                    Service providers haven't submitted any offers for this job.
                  </p>
                </div>
              )}
            </div>
          </section>

          <footer className="mt-8 text-center text-gray-500">
            Last updated: {job?.updatedAt}
          </footer>
        </div>
      </main>
    </div>
  );
}
