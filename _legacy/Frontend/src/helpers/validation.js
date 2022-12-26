import React from 'react';

let addStockSubmit = false;

export function validateSubmit(str) {
    switch (str) {
        case 'add-stock':
            addStockSubmit = true;
            break;
    }
}

export function invalidateSubmit(str) {
    switch (str) {
        case 'add-stock':
            addStockSubmit = false;
            break;
    }
}

export function isSubmitValid(str) {
    switch (str) {
        case 'add-stock':
            return addStockSubmit;
            break;
    }
}
