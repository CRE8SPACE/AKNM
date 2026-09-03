"use client";

import {
  useState,
} from "react";

import BookPurchaseModal from "./BookPurchaseModal";


type BookPurchaseButtonProps = {
  bookId: string;

  title: string;

  coverUrl: string | null;

  price: number;

  currency: string;
};


export default function BookPurchaseButton({
  bookId,
  title,
  coverUrl,
  price,
  currency,
}: BookPurchaseButtonProps) {

  const [
    open,
    setOpen,
  ] = useState(false);


  return (

    <>

      <button
        type="button"
        className="book-public-primary-action"
        onClick={() =>
          setOpen(true)
        }
      >

        Buy book

        <span>
          ↗
        </span>

      </button>


      <BookPurchaseModal
        bookId={
          bookId
        }

        title={
          title
        }

        coverUrl={
          coverUrl
        }

        price={
          price
        }

        currency={
          currency
        }

        open={
          open
        }

        onClose={() =>
          setOpen(false)
        }
      />

    </>

  );

}