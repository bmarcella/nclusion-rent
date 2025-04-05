
interface Props {
  onRestart: () => void;
  message?: string;
  btnText?: string;
}
const EndBank: React.FC<Props> = ({ onRestart, message = "Your form has been successfully submitted.", btnText = "Start a New Form" }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Green Checkmark */}
      <div className="bg-green-100 rounded-full p-6 mb-6">
        <svg
          className="w-16 h-16 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Thank You Message */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank you!</h1>
      <p className="text-gray-600 mb-6 text-center">
        { message } <br />
      </p>

      {/* Restart Button */}
      <button
        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition duration-200 shadow-md"
        onClick={onRestart}
      >
        {btnText}
      </button>
    </div>
  );
};

export default EndBank;

