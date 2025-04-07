import { useSessionUser } from "@/store/authStore";

const Home = () => {
  const { userId, authority } = useSessionUser((state) => state.user);
  const is_ai = authority && authority[0] == "agent_immobilier"; ;

    return <>
    <div className="flex flex-col justify-center items-center h-screen text-center px-4">
        <h1 className="text-4xl font-bold">Bienvenue sur la plateforme de gestion immobilière</h1>
        <p className="mt-4 text-lg">Utilisez le bouton en haut à droite pour ouvrir le menu.</p>

        {userId && is_ai && (
            <div className="mt-8 flex flex-col gap-4 items-center w-full max-w-sm">
            <a href="/proprio/add" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Ajouter entité
            </a>
            <a href="/proprio/myEntity" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Accéder à mes entités
            </a>
            <a href="/bank/add" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Ajouter banques
            </a>
            <a href="/bank/show" className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Accéder à mes banques
            </a>
            </div>
        )}
    </div>

    </>
}

export default Home
