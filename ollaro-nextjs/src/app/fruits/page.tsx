'use client'
import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBar from 'react-top-loading-bar';
import { customFetch } from '../utils/customFetcher';
import { Tooltip } from 'react-tooltip'
import { delay } from 'lodash';
import { useRouter } from 'next/navigation';
import logger from '@/app/utils/logger';

type Fruit = {
    _id: string;
    name: string;
    url: string;
};

export default function ItemList() {

    const [items, setItems] = useState<Fruit[]>([]);
    const [newItem, setNewItem] = useState('');
    const [isEditing, setIsEditing] = useState<number | null>(null); // Track the index of the item being edited
    const [editValue, setEditValue] = useState(''); // Store the current edit value
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const itemsPerPage = 5; // Items to show per page
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const loadingBarRef = useRef<any>(null);
    const [progress, setProgress] = useState<number>(0);
    const router = useRouter();

    // Fetch all items initially
    useEffect(() => {
        fetchItems();
    }, []);

    // Function to fetch all items
    const fetchItems = async () => {
        try {
        const response = await customFetch('/api/protected/fruits');
        if (response!.ok) {
            const { data } = await response!.json();
            data.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
            setItems(data);
        } else {
            console.error('Failed to fetch items');
            router.push('/auth/login');
        }
        } catch (error) {
            console.error('An error occurred:', error);
            router.push('/auth/login');
        }
    };

    // Function to clear the search box
    const clearSearch = () => {
        setSearchQuery('');
        fetchItems(); // Reset the items list to its original state
    };

    // Function to add a new item
    const addItem = async () => {
        if (newItem.trim()) {
            try {
                const response = await customFetch('/api/protected/fruits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: newItem }),
                });

                if (response!.ok) {
                    const { data } = await response!.json();
                    setItems((prevItems) => [...prevItems, data]);
                    setNewItem('');
                } else {
                    logger.error('Failed to add item');
                    toast.error('Failed to add item');
                }
            } catch (error) {
                logger.error('An error occurred:', error);
                toast.error('An error occurred');
            }
        }
    };

    /**
     * This function can be used to handle file input in applications where multiple items can 
     * have associated files (e.g., uploading images for different products in an inventory system).
     * Each item can be uniquely identified by itemId, allowing individual files to be selected and managed without overwriting others.
     * @param e 
     * @param itemId 
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          setSelectedFiles((prevSelectedFiles) => ({
            ...prevSelectedFiles,
            [itemId]: files[0],
          }));
          delay(() => {
            logger.debug('delayed by 2 seconds');
          }, 3000);
        }
    };

    // Handle the custom button click to open file dialog for a specific item
    const handleButtonClick = (itemId: string) => {
        fileInputRefs.current[itemId]?.click();
    };

    // Handle file upload
    const handleUpload = async (itemId: string) => {
        const selectedFile = selectedFiles[itemId];
        if (!selectedFile) {
            console.error('No file selected for item:', itemId);
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('itemId', itemId);
        
        try {
            // Start loading bar
            setProgress(0);
            loadingBarRef.current?.continuousStart(0);
            const response = await customFetch('/api/protected/upload', {
                method: 'POST',
                body: formData
            });

            if (response!.ok) {
                // Show success toast message
                toast.success(`File uploaded successfully for item: ${itemId}`);
                // Clear the selected file after successful upload
                setSelectedFiles((prevSelectedFiles) => ({
                    ...prevSelectedFiles,
                    [itemId]: null,
                }));
        
                // Clear the file input value
                if (fileInputRefs.current[itemId]) {
                    fileInputRefs.current[itemId]!.value = '';
                
                // Complete the loading bar
                setProgress(100);
                loadingBarRef.current?.complete();
                fetchItems();
            }
        } else {
            console.error('Failed to upload file');
            toast.error(`Failed to upload file for item: ${itemId}`);
        }
        } catch (error) {
            console.error('An error occurred while uploading the file:', error);
            toast.error(`An error occurred while uploading the file for item: ${itemId}`);
        }
    };
    

    const handleSearch = async () => {
        try {
          const response = await customFetch(`/api/protected/fruits/search?q=${searchQuery}`);
          if (response!.ok) {
            const { data } = await response!.json();
            // Sort the search results alphabetically by name
            data.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
            setItems(data);
          } else {
            console.error('Failed to search items');
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
    };

    // Function to remove an item by index
    const removeItem = async (itemId: string, index: number) => {
        try {
        const fruitId = itemId;
    
        const response = await customFetch(`/api/protected/fruits/${fruitId}`, {
            method: 'DELETE',
        });
    
        if (response!.ok) {
            // Remove the item from the local state if the deletion was successful
            setItems((prevItems) => prevItems.filter((_, i) => i !== index));
            fetchItems();
        } else {
            console.error('Failed to delete item');
        }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    // Function to start editing an item
    const startEditing = (index: number, itemVal: string) => {
        setIsEditing(index); // Set the index of the item being edited
        setEditValue(itemVal); // Set the edit value to the current item's value
    };

    // Function to handle saving the edited item
    const saveEdit = async (index: number, itemId: string) => {
        if (editValue.trim()) {
            try {
                const fruitId = itemId;

                const response = await customFetch(`/api/protected/fruits/${fruitId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: editValue }),
                });

                if (response!.ok) {
                    const { data } = await response!.json();
                    const updatedItems = [...items];
                    updatedItems[index] = data; // Update the item in the local state with the updated item from the response
                    setItems(updatedItems);
                    setIsEditing(null); // Exit edit mode
                    fetchItems();
                } else {
                    console.error('Failed to update item');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        }
    };

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    return (
        
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <LoadingBar color="#f11946" ref={loadingBarRef} />
            <ToastContainer />
            <h1 className="text-2xl font-bold text-center mb-6 text-black">Fruit List</h1>
            <div className="mt-6 flex">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a fruit"
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 flex-grow mr-2 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-4"
                >
                    Search
                </button>
                <button
                    onClick={clearSearch}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                    Clear
                </button>
            </div>
            <br>
            </br>
            <ul className="space-y-4">
                {items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <li key={item._id} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                        {isEditing === index ? (
                            <>
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 flex-grow mr-2 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <button
                                    onClick={() => saveEdit(index, item._id)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(null)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <img
                                    src={item.url || '/placeholder.png'} // Show placeholder if imageUrl is undefined
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded-full mr-4"
                                />
                                <span className="text-gray-700 font-medium">{item.name}</span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => startEditing(index, item.name)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => removeItem(item._id,index)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Remove
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*" // Accept only image files
                                        ref={(el) => {
                                            fileInputRefs.current[item._id] = el;
                                        }}
                                        onChange={(e) => handleFileChange(e, item._id)}
                                        style={{ display: 'none' }}
                                        />
                                    {/* Custom Button to Open File Dialog */}
                                    <button
                                        onClick={() => handleButtonClick(item._id)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                        id="clickable"
                                    >
                                        {selectedFiles[item._id]?.name ? truncateText(selectedFiles[item._id]!.name, 10) : '...'}
                                    </button>
                                    <button
                                        onClick={() => handleUpload(item._id)}
                                        className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg ${
                                        !selectedFiles[item._id] ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        disabled={!selectedFiles[item._id]}
                                    >
                                        Upload
                                    </button>
                                    <Tooltip anchorSelect="#clickable" clickable>
                                        <button>{selectedFiles[item._id]?.name ? selectedFiles[item._id]!.name : '...'}</button>
                                    </Tooltip>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    Previous
                </button>
                <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    Next
                </button>
            </div>

            {/* Input to add new items */}
            <div className="mt-6 flex">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add a new item"
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 flex-grow mr-2 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                    onClick={addItem}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                    Add Item
                </button>
            </div>
        </div>
    );
}