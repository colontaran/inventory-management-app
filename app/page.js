'use client'

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { firestore } from '@/firebase';
import {
  Box, Typography, Modal, Stack, TextField, Button, Autocomplete, IconButton
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import {
  collection, doc, getDocs, query, setDoc, deleteDoc, getDoc
} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filter, setFilter] = useState({ field: '', order: '' });

  const updateInventory = useCallback(async () => {
    if (typeof window === 'undefined') return; // Prevents execution during SSR

    try {
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });

      // Apply search filter
      const filteredInventory = inventoryList.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );

      // Apply sort filter
      if (filter.field === 'Name') {
        filteredInventory.sort((a, b) => {
          if (filter.order === 'asc') {
            return a.name.localeCompare(b.name);
          } else {
            return b.name.localeCompare(a.name);
          }
        });
      } else if (filter.field === 'Count') {
        filteredInventory.sort((a, b) => {
          if (filter.order === 'asc') {
            return a.quantity - b.quantity;
          } else {
            return b.quantity - a.quantity;
          }
        });
      }
      setInventory(filteredInventory);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }, [filter, searchValue]);

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }

      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, [updateInventory]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFilterChange = (field) => {
    setFilter((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getFilterLabel = (field) => {
    if (filter.field !== field) return `${field}`;
    return `${field} (${filter.order === 'asc' ? '↓' : '↑'})`;
  };

  const handleClearFilters = () => {
    setFilter({ field: '', order: '' });
    setSearchValue('');
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      position="relative"
    >
      <Stack direction="row" justifyContent="space-between" width="800px" mb={-1}>
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <Autocomplete
          value={searchValue}
          onChange={(event, newValue) => setSearchValue(newValue)}
          inputValue={searchValue}
          onInputChange={(event, newInputValue) => setSearchValue(newInputValue)}
          id="search-bar"
          options={inventory.map((item) => item.name)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Search here" />}
        />
      </Stack>
      <Box border={'1px solid #333'} p={2} borderRadius={2} width="800px">
        <Box
          width="100%"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          mb={1}
          borderRadius={2}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack direction="row" width="100%" spacing={1} p={2} height="60px" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={3}>
            <Button
              onClick={() => handleFilterChange('Name')}
              variant={filter.field === 'Name' ? 'contained' : 'outlined'}
            >
              {getFilterLabel('Name')} <FilterAltOutlinedIcon />
            </Button>
            <Button
              onClick={() => handleFilterChange('Count')}
              variant={filter.field === 'Count' ? 'contained' : 'outlined'}
            >
              {getFilterLabel('Count')} <FilterAltOutlinedIcon />
            </Button>
          </Stack>
          <IconButton onClick={handleClearFilters} color="default">
            <FilterAltOffOutlinedIcon />
          </IconButton>
        </Stack>
        <Stack width="100%" spacing={1} overflow="auto" border={'1px solid #333'} borderRadius={2} p={2} height="400px">
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="80px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={2}
              border={'1px solid #ccc'}
              borderRadius={2}
            >
              <Typography variant="h5" color="#333" textAlign="left" width="50%">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h5" color="#333" textAlign="center" width="40%">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton 
                  onClick={() => addItem(name)} 
                  sx={{ backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }}
                >
                  <AddOutlinedIcon />
                </IconButton>
                <IconButton 
                  onClick={() => removeItem(name)} 
                  sx={{ backgroundColor: '#cc0000', color: 'white', '&:hover': { backgroundColor: 'darkred' } }}
                >
                  <RemoveOutlinedIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  await addItem(itemName);
                } catch (error) {
                  console.error('Error adding item:', error);
                } finally {
                  setItemName('');
                  handleClose();
                }
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
