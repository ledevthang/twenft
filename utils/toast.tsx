import { toast } from "react-toastify";

export const withToast: (promise: any) => void = (promise) => {
  toast.promise(
    promise,
    {
      pending: "Processing your transaction",
      success: {
        render({ data }: any) {
          return (
            <div>
              <p className="font-bold text-sm">
                Tx: {data?.hash?.slice(0, 20)}...
              </p>
              <p className="text-xs text-green-400">
                Has been successfully processed.
              </p>
              <a
                href={`https://testnet.bscscan.com/tx/${data?.hash}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className="text-indigo-600 underline text-sm ">
                  See Tx Details
                </i>
              </a>
            </div>
          );
        },
        // other options
        icon: "🟢",
      },
      error: {
        render({ data }) {
          // When the promise reject, data will contains the error

          return (
            <div className="text-sm text-orange-400">
              {data.message ?? "Transaction has failed"}
            </div>
          );
        },
      },
    },
    {
      closeButton: true,
    }
  );
};
