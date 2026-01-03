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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
      <div className="flex min-h-screen items-center justify-center bg-(--primary)">
        <Loader2 className="h-8 w-8 animate-spin text-(--muted)" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-(--primary) py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-(--text)">Job Details</h1>
            <p className="text-(--muted) mt-1">Details for service providers</p>
          </div>

          <section className="bg-(--primary) border border-(--border) rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-(--text)">
                  {job?.title}
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium capitalize">
                {job?.jobStatus}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {job?.images && job.images.length > 0 ? (
                  <div>
                    <img
                      src={job.images[selectedImageIndex]}
                      alt={job?.title || "Job image"}
                      className="w-full h-80 object-cover rounded-2xl"
                      loading="lazy"
                    />

                    {job.images.length > 1 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {job.images.map((image, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`overflow-hidden rounded-md border transition focus:outline-none ${
                              selectedImageIndex === idx
                                ? "ring-2 ring-blue-500"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${job.title || "Job"} ${idx + 1}`}
                              className="w-full h-20 object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-80 bg-(--secondary) rounded-2xl flex items-center justify-center text-(--muted)">
                    No image
                  </div>
                )}
              </div>

              <div className="md:col-span-2 text-sm text-(--text)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-(--muted)" />
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-(--muted)">{job?.jobCategory}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-(--muted)" />
                    <div>
                      <p className="font-medium">Your Price</p>
                      <p className="text-(--muted) text-2xl">
                        Rs. {job?.userPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-(--muted)" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-(--muted)">
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
                    <Calendar className="w-4 h-4 text-(--muted)" />
                    <div>
                      <p className="font-medium">Posted</p>
                      <p className="text-(--muted)">
                        {new Date(job?.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-(--muted)" /> Description
                  </p>
                  <p className="text-(--text) mt-2">{job?.description}</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-md bg-red-600 text-(--primary) rounded-lg hover:bg-red-700 transition">
                    <Ban className="w-4 h-4" />
                    Cancel Job
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xl font-semibold text-(--text) mb-4">
              <Inbox className="w-5 h-5 inline-block mr-2 text-(--text)" />
              Offers
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {job?.offers && job.offers.length > 0 ? (
                job.offers.map((offer) => {
                  const provider = offer.serviceProviderId;

                  return (
                    <div
                      key={offer._id}
                      className="bg-(--primary) border border-(--border) rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        {/* Provider Info */}
                        <div className="space-y-1">
                          <p className="font-semibold text-(--text)">
                            {provider.fullName}
                          </p>

                          <p className="text-sm text-(--muted)">
                            Category: {provider.providerCategory || "N/A"}
                          </p>
                        </div>

                        {/* Offer Info */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-(--text)">
                            Rs. {offer.offeredPrice}
                          </p>

                          <p className="text-xs text-(--muted)">
                            {new Date(offer.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-4 text-sm text-(--text) space-y-1">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-(--muted)" />{" "}
                          {provider.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-(--muted)" />{" "}
                          {provider.phoneNumber}
                        </p>
                        {provider.address && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-(--muted)" />{" "}
                            {provider.address}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1 bg-green-600 text-(--primary) rounded-lg text-sm flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-(--muted)">
                  <p className="text-lg font-medium">No offers yet</p>
                  <p className="text-sm">
                    Service providers haven't submitted any offers for this job.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
