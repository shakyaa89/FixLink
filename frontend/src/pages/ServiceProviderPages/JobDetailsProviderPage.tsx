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

export default function JobDetailsProviderPage() {
  const [job, setJob] = useState<JobData>();
  const [loading, setLoading] = useState(true);
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

  console.log(job);

  async function handleSendOffer() {
    if (!offeredPrice) {
      setModalError("Please enter an offer price.");
      return;
    } else if (Number(offeredPrice) <= job?.userPrice!) {
      setModalError("Offer price must be higher than the current price.");
      return;
    } else if (Number(offeredPrice) >= job?.userPrice! + 500) {
      setModalError("Offer price is too high.");
      return;
    }

    setModalError("");

    try {
      setSendingOffer(true);
      await OfferApi.createOffer({
        jobId: job?._id!,
        offeredPrice: Number(offeredPrice),
      });

      // success
      setOfferModal(false);
      setOfferedPrice("");
      alert("Offer submitted");
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                  <p className="font-medium">Offered Price</p>
                  <p className="text-gray-600 text-2xl">Rs. {job?.userPrice}</p>
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

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOfferModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Send Offer
              </button>
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
