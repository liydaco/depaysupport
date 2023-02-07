import React, { useEffect, useState } from "react";
import DePayWidgets from "@depay/widgets";
import { BuyCrypto } from "iconsax-react";
import axios from "axios";

import { CREATE_ENTRY } from "../../util/graphql";
import { GET_ENTRIES } from "../../util/graphql";
import { useMutation } from "@apollo/client";

import { toast } from "react-toastify";

export default ({ markers, setMarkers, setOpenCart }) => {
  const [createEntry] = useMutation(CREATE_ENTRY, {
    onError: (err) => {},
    onCompleted(data) {
      setMarkers([]);
      setOpenCart(false);
      toast.success("Payment successful. Good Luck!");
    },
  });

  const handleCreateEntries = () => {
    createEntry({
      variables: {
        entry: markers,
      },
      update: (cache, { data: { createEntry } }) => {
        const { getEntries } = cache.readQuery({ query: GET_ENTRIES });
        const newData = getEntries.concat(createEntry);
        cache.writeQuery({
          query: GET_ENTRIES,

          data: { getEntries: newData },
        });
      },
    });
  };

  let unmount;

  let amount = () => {
    return markers.reduce((n, { ticketPrice }) => n + ticketPrice, 0);
  };

  const openPaymentWidget = async () => {
    ({ unmount } = await DePayWidgets.Payment({
      integration: "7dd5ccaa-4af1-4824-9d4f-963f1a613012",

      validated: (successful) => {
        console.log(successful);
        if (successful) {
          console.log(successful);
          handleCreateEntries();
        }
      },

      sent: (transaction) => {
        console.log(transaction);
        if (transaction) {
          axios.post(
            "https://moby-payments-api-production.up.railway.app/track/payments",
            {
              markers,
              transaction,
            }
          );
        }
        console.log(transaction);
      },

      succeeded: (transaction) => {
        console.log(transaction);
        axios.post(
          "https://moby-payments-api-production.up.railway.app/track/payments",
          {
            markers,
            transaction,
          }
        );
      },

      track: {
        method: (payment) =>
          axios
            .post(
              "https://moby-payments-api-production.up.railway.app/track/payments/track",
              {
                payment,
              }
            )
            .then((response) => response.data),
        // async: true,
      },

      accept: [
        {
          blockchain: "bsc",
          amount: amount(),
          token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          receiver: "0x60C611D9F3f50a903A9ff112Eea7887B5F9b6064",
        },
        {
          blockchain: "ethereum",
          amount: amount(),
          token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          receiver: "0x60C611D9F3f50a903A9ff112Eea7887B5F9b6064",
        },
        {
          blockchain: "polygon",
          amount: amount(),
          token: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          receiver: "0x60C611D9F3f50a903A9ff112Eea7887B5F9b6064",
        },
      ],
    }));
  };

  useEffect(() => {
    return () => {
      // make sure an open widgets gets closed/unmounted as part of this component
      if (unmount) {
        unmount();
      }
    };
  }, []);

  return (
    <button
      disabled={markers.length === 0}
      href="#"
      onClick={openPaymentWidget}
      className="flex w-full cursor-pointer items-center justify-center rounded-md border border-transparent bg-purple-700 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-purple-600 disabled:pointer-events-none disabled:opacity-50"
    >
      Checkout with Crypto
      <BuyCrypto className="ml-2" size="24" color="#FFFFFF" variant="TwoTone" />
    </button>
  );
};
