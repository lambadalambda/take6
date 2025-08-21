'use client'

import React, { useState } from 'react'
import { Card } from '../../../components/Card'
import { Board } from '../../../components/Board'
import { PlayerHand } from '../../../components/PlayerHand'
import { createCard } from '../../../engine/card'
import { type Board as BoardType } from '../../../engine/board'
import { type Card as CardType } from '../../../engine/card'

export default function ComponentsDevPage() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [selectedHandCard, setSelectedHandCard] = useState<CardType | null>(null)

  const exampleCards = [
    createCard(1),   // 1 bull head
    createCard(5),   // 2 bull heads (divisible by 5)
    createCard(10),  // 3 bull heads (divisible by 10)
    createCard(11),  // 5 bull heads (divisible by 11)
    createCard(55),  // 7 bull heads (special case)
    createCard(100), // 3 bull heads (divisible by 10)
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Component Library</h1>

      {/* Card Component */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Card Component</h2>
        
        <div className="space-y-8">
          {/* Basic Cards */}
          <div>
            <h3 className="text-lg font-medium mb-3">Basic Cards (Different Bull Heads)</h3>
            <div className="flex gap-4 flex-wrap">
              {exampleCards.map((card) => (
                <Card key={card.number} card={card} />
              ))}
            </div>
          </div>

          {/* Interactive Cards */}
          <div>
            <h3 className="text-lg font-medium mb-3">Interactive Cards (Click to Select)</h3>
            <div className="flex gap-4 flex-wrap">
              {exampleCards.slice(0, 3).map((card) => (
                <Card
                  key={card.number}
                  card={card}
                  onClick={() => setSelectedCard(card.number)}
                  selected={selectedCard === card.number}
                />
              ))}
            </div>
            {selectedCard && (
              <p className="mt-2 text-sm text-gray-600">Selected: Card {selectedCard}</p>
            )}
          </div>

          {/* Disabled Cards */}
          <div>
            <h3 className="text-lg font-medium mb-3">Disabled Cards</h3>
            <div className="flex gap-4 flex-wrap">
              {exampleCards.slice(0, 3).map((card) => (
                <Card
                  key={card.number}
                  card={card}
                  onClick={() => console.log('Clicked disabled card')}
                  disabled={true}
                />
              ))}
            </div>
          </div>

          {/* Custom Styled Cards */}
          <div>
            <h3 className="text-lg font-medium mb-3">Custom Styled Cards</h3>
            <div className="flex gap-4 flex-wrap">
              <Card
                card={createCard(42)}
                className="bg-gradient-to-r from-blue-100 to-blue-200"
              />
              <Card
                card={createCard(77)}
                className="bg-gradient-to-r from-green-100 to-green-200 scale-110"
              />
              <Card
                card={createCard(99)}
                className="bg-gradient-to-r from-purple-100 to-purple-200 rotate-3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Board Component */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Board Component</h2>
        
        <div className="space-y-8">
          {/* Example game board */}
          <div>
            <h3 className="text-lg font-medium mb-3">Game Board (Various Row States)</h3>
            <Board 
              board={[
                [createCard(10), createCard(15)],  // Row with 2 cards
                [createCard(20)],  // Row with 1 card
                [createCard(30), createCard(35), createCard(40)],  // Row with 3 cards
                [createCard(50), createCard(55), createCard(60), createCard(65), createCard(70)]  // Full row (5 cards)
              ]}
            />
          </div>

          {/* Empty board */}
          <div>
            <h3 className="text-lg font-medium mb-3">Empty Board (Start of Round)</h3>
            <Board 
              board={[
                [createCard(5)],
                [createCard(25)],
                [createCard(45)],
                [createCard(85)]
              ]}
            />
          </div>
        </div>
      </section>

      {/* PlayerHand Component */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">PlayerHand Component</h2>
        
        <div className="space-y-8">
          {/* Human player hand */}
          <div>
            <h3 className="text-lg font-medium mb-3">Human Player Hand (Interactive)</h3>
            <PlayerHand
              cards={[
                createCard(5), createCard(12), createCard(23), createCard(34),
                createCard(45), createCard(56), createCard(67), createCard(78),
                createCard(89), createCard(100)
              ]}
              playerName="Alice"
              onCardSelect={(card) => setSelectedHandCard(card)}
              selectedCard={selectedHandCard}
            />
            {selectedHandCard && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: Card {selectedHandCard.number} ({selectedHandCard.bullHeads} bull heads)
              </p>
            )}
          </div>

          {/* AI player hand */}
          <div>
            <h3 className="text-lg font-medium mb-3">AI Player Hand (Disabled)</h3>
            <PlayerHand
              cards={[
                createCard(10), createCard(20), createCard(30), createCard(40),
                createCard(50), createCard(60), createCard(70), createCard(80)
              ]}
              playerName="Bot1"
              isAI={true}
              disabled={true}
            />
          </div>

          {/* Empty hand */}
          <div>
            <h3 className="text-lg font-medium mb-3">Empty Hand</h3>
            <PlayerHand
              cards={[]}
              playerName="Bob"
            />
          </div>
        </div>
      </section>

      <section className="mb-12 opacity-50">
        <h2 className="text-2xl font-semibold mb-4">ScoreBoard Component</h2>
        <p className="text-gray-600">Coming soon...</p>
      </section>
    </div>
  )
}