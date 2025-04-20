// src/App.jsx
import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCw,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import { initialWords, CATEGORIES } from "./data/words"; // Importa i dati dal file esterno

function App() {
  // Carica le carte dal localStorage se disponibili
  const loadCardsFromStorage = () => {
    const savedCards = localStorage.getItem("flashcards");
    if (savedCards) {
      return JSON.parse(savedCards);
    }
    return initialWords; // Usa i dati dal file esterno
  };

  const [cards, setCards] = useState(loadCardsFromStorage);
  const [activeCards, setActiveCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Salva le carte nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(cards));
  }, [cards]);

  // Filtra le carte in base alla categoria attiva
  useEffect(() => {
    let filteredCards;

    if (activeCategory === "all") {
      filteredCards = cards;
    } else {
      filteredCards = cards.filter((card) => card.category === activeCategory);
    }

    setActiveCards(filteredCards);

    if (filteredCards.length === 0) {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  }, [activeCategory, cards]);

  const getCategoryLabel = (category) => {
    switch (category) {
      case CATEGORIES.NEW:
        return "Nuove";
      case CATEGORIES.CORRECT:
        return "Fatte";
      case CATEGORIES.REVIEW:
        return "Da rivedere";
      case CATEGORIES.WRONG:
        return "Sbagliate";
      default:
        return "Tutte";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case CATEGORIES.NEW:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case CATEGORIES.CORRECT:
        return "bg-green-100 text-green-800 border-green-300";
      case CATEGORIES.REVIEW:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case CATEGORIES.WRONG:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (answerCategory) => {
    // Aggiorna la categoria della carta corrente
    const updatedCards = cards.map((card) => {
      if (card.id === activeCards[currentCardIndex].id) {
        return {
          ...card,
          category: answerCategory,
        };
      }
      return card;
    });

    setCards(updatedCards);

    // Passa alla carta successiva o termina la sessione
    if (currentCardIndex < activeCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
    }
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const addNewCard = (card) => {
    const newId = Math.max(...cards.map((c) => c.id), 0) + 1;
    const newCard = {
      id: newId,
      word: card.word,
      type: card.type || "",
      meaning: card.meaning,
      category: CATEGORIES.NEW,
    };

    setCards([...cards, newCard]);
  };

  const resetAllCards = () => {
    if (
      window.confirm(
        'Sei sicuro di voler resettare tutte le carte alla categoria "Nuove"? Questa azione non può essere annullata.'
      )
    ) {
      const resetedCards = cards.map((card) => ({
        ...card,
        category: CATEGORIES.NEW,
      }));

      setCards(resetedCards);
      resetSession();
      setShowSettings(false);
    }
  };

  // Component per aggiungere nuove carte
  const AddCardForm = () => {
    const [newCard, setNewCard] = useState({
      word: "",
      type: "",
      meaning: "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (newCard.word.trim() && newCard.meaning.trim()) {
        addNewCard(newCard);
        setNewCard({ word: "", type: "", meaning: "" });
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="mt-4 p-4 bg-white rounded-lg shadow"
      >
        <h3 className="font-bold mb-3">Aggiungi Nuova Carta</h3>
        <div className="mb-3">
          <label className="block text-sm mb-1">Parola</label>
          <input
            type="text"
            value={newCard.word}
            onChange={(e) => setNewCard({ ...newCard, word: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Tipo (opzionale)</label>
          <input
            type="text"
            value={newCard.type}
            onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Significato</label>
          <input
            type="text"
            value={newCard.meaning}
            onChange={(e) =>
              setNewCard({ ...newCard, meaning: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Aggiungi
        </button>
      </form>
    );
  };

  // Visualizzazione delle statistiche e gestione
  const SettingsView = () => {
    const categoryCounts = {
      [CATEGORIES.NEW]: cards.filter((card) => card.category === CATEGORIES.NEW)
        .length,
      [CATEGORIES.CORRECT]: cards.filter(
        (card) => card.category === CATEGORIES.CORRECT
      ).length,
      [CATEGORIES.REVIEW]: cards.filter(
        (card) => card.category === CATEGORIES.REVIEW
      ).length,
      [CATEGORIES.WRONG]: cards.filter(
        (card) => card.category === CATEGORIES.WRONG
      ).length,
    };

    const totalCards = cards.length;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Impostazioni e Statistiche</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">Statistiche</h3>
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between mb-2">
              <span>Carte totali:</span>
              <span className="font-medium">{totalCards}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">Carte per Categoria</h3>
          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div
                key={category}
                className={`px-3 py-2 rounded flex justify-between ${getCategoryColor(
                  category
                )}`}
              >
                <span>{getCategoryLabel(category)}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">Filtra per Categoria</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveCategory("all");
                setShowSettings(false);
              }}
              className={`py-2 rounded text-center ${
                activeCategory === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Tutte
            </button>
            {Object.values(CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setShowSettings(false);
                }}
                className={`py-2 rounded text-center ${
                  activeCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        <AddCardForm />

        <div className="mt-4">
          <button
            onClick={resetAllCards}
            className="w-full py-2 bg-red-500 text-white rounded flex items-center justify-center font-medium hover:bg-red-600"
          >
            <RotateCw className="mr-2 h-4 w-4" /> Resetta Tutte le Carte
          </button>
        </div>
      </div>
    );
  };

  // Visualizzazione completata
  const CompletedView = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          {activeCards.length > 0 ? "Completato!" : "Nessuna carta disponibile"}
        </h2>

        <div className="mb-6 text-center">
          {activeCategory !== "all" ? (
            <p>
              Hai completato tutte le carte nella categoria
              {getCategoryLabel(activeCategory)}.
            </p>
          ) : (
            <p>Hai completato tutte le carte disponibili.</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-2 bg-blue-500 text-white rounded flex items-center justify-center font-medium hover:bg-blue-600"
          >
            <Settings className="mr-2 h-4 w-4" /> Impostazioni
          </button>
        </div>
      </div>
    );
  };

  if (showSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <SettingsView />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <CompletedView />
      </div>
    );
  }

  // Controlla se ci sono carte attive prima di renderizzare una carta
  if (activeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <CompletedView />
      </div>
    );
  }

  const currentCard = activeCards[currentCardIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Flashcards Inglese</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p>
            Carta {currentCardIndex + 1} di {activeCards.length}
          </p>
          {activeCategory !== "all" && (
            <div
              className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                activeCategory
              )}`}
            >
              {getCategoryLabel(activeCategory)}
            </div>
          )}
        </div>

        <div
          className="relative w-full h-64 cursor-pointer mb-4"
          onClick={handleCardClick}
          style={{ perspective: "1000px" }}
        >
          {/* Front of card */}
          <div
            className={`absolute w-full h-full bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center transition-all duration-500 ${
              isFlipped ? "opacity-0" : "opacity-100"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <h2 className="text-3xl font-bold mb-2">{currentCard.word}</h2>
            {currentCard.type && (
              <p className="text-gray-500 italic">{currentCard.type}</p>
            )}
            <p className="mt-6 text-gray-600">
              Tocca per vedere il significato
            </p>

            {currentCard.category !== CATEGORIES.NEW && (
              <div className="absolute bottom-2 right-3 text-xs">
                <div
                  className={`px-2 py-1 rounded-full ${getCategoryColor(
                    currentCard.category
                  )}`}
                >
                  {getCategoryLabel(currentCard.category)}
                </div>
              </div>
            )}
          </div>

          {/* Back of card */}
          <div
            className={`absolute w-full h-full bg-blue-50 rounded-lg shadow-md p-6 flex flex-col items-center justify-center transition-all duration-500 ${
              isFlipped ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
            }}
          >
            <p className="text-lg font-medium mb-2">Significato:</p>
            <h2 className="text-2xl font-bold mb-6">{currentCard.meaning}</h2>

            <div className="mt-4 grid grid-cols-3 gap-2 w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(CATEGORIES.CORRECT);
                }}
                className="py-2 bg-green-500 text-white rounded flex items-center justify-center hover:bg-green-600"
              >
                <Check className="mr-1 h-4 w-4" /> Fatta
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(CATEGORIES.REVIEW);
                }}
                className="py-2 bg-yellow-500 text-white rounded flex items-center justify-center hover:bg-yellow-600"
              >
                <HelpCircle className="mr-1 h-4 w-4" /> Dubbio
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(CATEGORIES.WRONG);
                }}
                className="py-2 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
              >
                <X className="mr-1 h-4 w-4" /> Sbagliata
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between w-full mt-6">
          <button
            onClick={() => {
              if (currentCardIndex > 0) {
                setCurrentCardIndex(currentCardIndex - 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentCardIndex === 0}
            className={`flex items-center ${
              currentCardIndex === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-blue-500 hover:text-blue-700"
            }`}
          >
            <ChevronLeft className="h-5 w-5" /> Precedente
          </button>
          <button
            onClick={() => {
              if (currentCardIndex < activeCards.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentCardIndex === activeCards.length - 1}
            className={`flex items-center ${
              currentCardIndex === activeCards.length - 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-blue-500 hover:text-blue-700"
            }`}
          >
            Successiva <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
