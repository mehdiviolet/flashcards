// src/App.jsx
import { useState, useEffect } from "react";
import { Check, RotateCw, Settings, HelpCircle, X } from "lucide-react";
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
  const [flippedCardIds, setFlippedCardIds] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  // Salva le carte nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(cards));
  }, [cards]);

  // Raggruppa le carte per categoria
  const cardsByCategory = {
    all: cards.filter(
      (card) =>
        card.category === CATEGORIES.NEW || card.category === CATEGORIES.WRONG
    ),
    review: cards.filter((card) => card.category === CATEGORIES.REVIEW),
    correct: cards.filter((card) => card.category === CATEGORIES.CORRECT),
  };

  const toggleCardFlip = (cardId) => {
    setFlippedCardIds((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleAnswer = (cardId, answerCategory, e) => {
    e.stopPropagation();

    // Aggiorna la categoria della carta
    const updatedCards = cards.map((card) => {
      if (card.id === cardId) {
        return {
          ...card,
          category: answerCategory,
        };
      }
      return card;
    });

    setCards(updatedCards);
  };

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

  const getCardBackgroundColor = (category) => {
    switch (category) {
      case CATEGORIES.CORRECT:
        return "bg-green-50";
      case CATEGORIES.REVIEW:
        return "bg-yellow-50";
      case CATEGORIES.WRONG:
        return "bg-red-50";
      default:
        return "bg-white";
    }
  };

  const getColumnHeaderColor = (column) => {
    switch (column) {
      case "correct":
        return "bg-green-100 border-green-300";
      case "review":
        return "bg-yellow-100 border-yellow-300";
      case "all":
      default:
        return "bg-blue-100 border-blue-300";
    }
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

  // Componente per renderizzare una singola carta
  const FlashCard = ({ card }) => {
    const isFlipped = flippedCardIds[card.id];

    return (
      <div
        className={`relative cursor-pointer h-48 rounded-lg shadow-md mb-4 ${getCardBackgroundColor(
          card.category
        )}`}
        onClick={() => toggleCardFlip(card.id)}
        style={{ perspective: "1000px" }}
      >
        {/* Front of card */}
        <div
          className={`absolute w-full h-full rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-500 ${
            isFlipped ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <h2 className="text-xl font-bold mb-2 text-center">{card.word}</h2>
          {card.type && (
            <p className="text-gray-500 italic text-center">{card.type}</p>
          )}
          <p className="mt-4 text-gray-600 text-sm text-center">
            Tocca per vedere il significato
          </p>

          {card.category !== CATEGORIES.NEW && (
            <div className="absolute bottom-2 right-3 text-xs">
              <div
                className={`px-2 py-1 rounded-full ${getCategoryColor(
                  card.category
                )}`}
              >
                {getCategoryLabel(card.category)}
              </div>
            </div>
          )}
        </div>

        {/* Back of card */}
        <div
          className={`absolute w-full h-full rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-500 ${
            isFlipped ? "opacity-100" : "opacity-0"
          } ${card.category === CATEGORIES.NEW ? "bg-blue-50" : ""}`}
          style={{
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
          }}
        >
          <p className="text-sm font-medium mb-2">Significato:</p>
          <h2 className="text-lg font-bold mb-4 text-center">{card.meaning}</h2>

          <div className="mt-2 grid grid-cols-3 gap-1 w-full">
            <button
              onClick={(e) => handleAnswer(card.id, CATEGORIES.CORRECT, e)}
              className="py-1 px-1 bg-green-500 text-white text-xs rounded flex items-center justify-center hover:bg-green-600"
            >
              <Check className="mr-1 h-3 w-3" /> Fatta
            </button>
            <button
              onClick={(e) => handleAnswer(card.id, CATEGORIES.REVIEW, e)}
              className="py-1 px-1 bg-yellow-500 text-white text-xs rounded flex items-center justify-center hover:bg-yellow-600"
            >
              <HelpCircle className="mr-1 h-3 w-3" /> Dubbio
            </button>
            <button
              onClick={(e) => handleAnswer(card.id, CATEGORIES.WRONG, e)}
              className="py-1 px-1 bg-red-500 text-white text-xs rounded flex items-center justify-center hover:bg-red-600"
            >
              <X className="mr-1 h-3 w-3" /> Sbagliata
            </button>
          </div>
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Flashcards Inglese</h1>
            <p className="text-gray-600">Totale parole: {cards.length}</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Colonna 1: Nuove e Sbagliate */}
          <div className="bg-white rounded-lg shadow-md">
            <div
              className={`p-3 rounded-t-lg font-semibold ${getColumnHeaderColor(
                "all"
              )} border-b`}
            >
              Da Studiare ({cardsByCategory.all.length})
            </div>
            <div className="p-4">
              {cardsByCategory.all.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nessuna carta da studiare
                </p>
              ) : (
                <div className="space-y-2">
                  {cardsByCategory.all.map((card) => (
                    <FlashCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonna 2: Da rivedere */}
          <div className="bg-white rounded-lg shadow-md">
            <div
              className={`p-3 rounded-t-lg font-semibold ${getColumnHeaderColor(
                "review"
              )} border-b`}
            >
              Da Rivedere ({cardsByCategory.review.length})
            </div>
            <div className="p-4">
              {cardsByCategory.review.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nessuna carta da rivedere
                </p>
              ) : (
                <div className="space-y-2">
                  {cardsByCategory.review.map((card) => (
                    <FlashCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonna 3: Fatte */}
          <div className="bg-white rounded-lg shadow-md">
            <div
              className={`p-3 rounded-t-lg font-semibold ${getColumnHeaderColor(
                "correct"
              )} border-b`}
            >
              Completate ({cardsByCategory.correct.length})
            </div>
            <div className="p-4">
              {cardsByCategory.correct.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nessuna carta completata
                </p>
              ) : (
                <div className="space-y-2">
                  {cardsByCategory.correct.map((card) => (
                    <FlashCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
