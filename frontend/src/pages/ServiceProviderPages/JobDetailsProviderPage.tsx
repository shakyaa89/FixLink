import Sidebar from "../../components/Sidebar/Sidebar";
import { JobApi, type JobData, OfferApi } from "../../api/Apis";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Loader2,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  PlusCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function JobDetailsProviderPage() {
  const [job, setJob] = useState<JobData>();
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { jobId } = useParams();

  const [offerModal, setOfferModal] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [modalError, setModalError] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);

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

  async function handleSendOffer() {
    const offeredPriceNum = Number(offeredPrice);

    const offerLowerLimit = job?.userPrice! - (job?.userPrice! * 20) / 100;

    const offerUpperLimit = job?.userPrice! + (job?.userPrice! * 20) / 100;

    if (!offeredPrice) {
      setModalError("Please enter an offer price.");
      return;
    } else if (offeredPriceNum < offerLowerLimit) {
      setModalError("Offer price too low.");
      return;
    } else if (offeredPriceNum > offerUpperLimit) {
      setModalError("Offer price is too high.");
      return;
    }

    setModalError("");

    try {
      setSendingOffer(true);
      await OfferApi.createOffer({
        jobId: job?._id!,
        offeredPrice: offeredPriceNum,
      });

      // success
      setOfferModal(false);
      setOfferedPrice("");
      toast.success("Offer submitted");
    } catch (err: any) {
      console.error(err);
      setModalError(err?.response?.data?.message || "Failed to submit offer");
    } finally {
      setSendingOffer(false);
    }
  }

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

      {offerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Send Offer
            </h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Price
            </label>

            <input
              type="number"
              value={offeredPrice}
              onChange={(e) => {
                setOfferedPrice(e.target.value);
                setModalError("");
              }}
              placeholder={`Current offer: Rs. ${job?.userPrice}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {modalError && <p className="text-red-500">{modalError}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOfferModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSendOffer()}
                disabled={sendingOffer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60 flex items-center gap-2"
              >
                {sendingOffer ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit Offer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

                <p className="text-gray-700 mt-2">
                  Posted By: {job?.userId.fullName}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium capitalize">
                {job?.jobStatus}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {job?.images && job.images.length > 0 ? (
                  <div>
                    <img
                      src={job.images[selectedImageIndex]}
                      alt={job?.title || "Job image"}
                      className="w-full h-56 md:h-80 object-cover rounded-2xl"
                      loading="lazy"
                    />

                    {job.images.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {job.images.map((image, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`shrink-0 w-24 h-20 overflow-hidden rounded-md border transition focus:outline-none ${
                              selectedImageIndex === idx
                                ? "ring-2 ring-blue-500"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${job.title || "Job"} ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="md:col-span-2 text-sm text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <p className="font-medium">Offered Price</p>
                      <p className="text-gray-600 text-2xl">
                        Rs. {job?.userPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">
                        <a
                          href={job?.locationURL ? job?.locationURL : "#"}
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
                      <p className="font-medium">Posted Date</p>
                      <p className="text-gray-600">
                        {job?.createdAt?.split("T")[0]}
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

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setOfferModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 justify-center"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Send Offer
                  </button>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-8 text-center text-gray-500">
            Last updated: {new Date(job?.updatedAt!).toLocaleDateString()}
          </footer>
        </div>
      </main>
    </div>
  );
}
